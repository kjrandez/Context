using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Input.Inking;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using Windows.ApplicationModel.DataTransfer.DragDrop;
using Windows.ApplicationModel.DataTransfer.DragDrop.Core;
using Windows.ApplicationModel.DataTransfer;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace shell_windows
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    /// 

    class StrokeColor
    {
        public float r, g, b;
    }
    class Stroke
    {
        public int width;
        public StrokeColor color;
        public string points;
    }

    

    public sealed partial class MainPage : Page
    {
        private InkStrokeBuilder strokeBuilder;
        private List<uint> strokeIds;

        public MainPage()
        {
            this.strokeIds = new List<uint>();
            this.InitializeComponent();

            this.InkCanvas.InkPresenter.InputDeviceTypes =
                Windows.UI.Core.CoreInputDeviceTypes.Mouse |
                Windows.UI.Core.CoreInputDeviceTypes.Pen;


            this.strokeBuilder = new InkStrokeBuilder();

            this.InkCanvas.InkPresenter.StrokesCollected += InkPresenter_StrokesCollected;
            this.InkCanvas.InkPresenter.StrokesErased += InkPresenter_StrokesErased;

            //  DispatcherTimer setup
            var dispatcherTimer = new DispatcherTimer();
            dispatcherTimer.Tick += dispatcherTimer_Tick;
            dispatcherTimer.Interval = new TimeSpan(0, 0, 1);
            dispatcherTimer.Start();
        }

        private void dispatcherTimer_Tick(object sender, object e)
        {
            if (this.Rect.Visibility == Visibility.Visible)
                this.Rect.Visibility = Visibility.Collapsed;
            else
                this.Rect.Visibility = Visibility.Visible;
        }

        private string encodedStroke(InkStroke stroke)
        {
            var points = stroke.GetInkPoints();
            byte[] raw = new byte[points.Count * 12];

            int i = 0;
            foreach (InkPoint point in points)
            {
                byte[] X = BitConverter.GetBytes((float)point.Position.X);
                byte[] Y = BitConverter.GetBytes((float)point.Position.Y);
                byte[] P = BitConverter.GetBytes(point.Pressure);

                raw[i++] = X[0];
                raw[i++] = X[1];
                raw[i++] = X[2];
                raw[i++] = X[3];
                raw[i++] = Y[0];
                raw[i++] = Y[1];
                raw[i++] = Y[2];
                raw[i++] = Y[3];
                raw[i++] = P[0];
                raw[i++] = P[1];
                raw[i++] = P[2];
                raw[i++] = P[3];
            }

            return Convert.ToBase64String(raw);
        }

        private InkStroke decodedStroke(string encoded)
        {
            byte[] raw = Convert.FromBase64String(encoded);

            List<InkPoint> points = new List<InkPoint>();

            for (int i = 0; i < raw.Length / 12; i++)
            {
                float X = BitConverter.ToSingle(raw, (i * 12));
                float Y = BitConverter.ToSingle(raw, (i * 12) + 4);
                float P = BitConverter.ToSingle(raw, (i * 12) + 8);

                points.Add(new InkPoint(new Point(X, Y), P));
            }

            return strokeBuilder.CreateStrokeFromInkPoints(points, System.Numerics.Matrix3x2.Identity, null, null);
        }

        private void sendMessage(string message)
        {
            this.webView.InvokeScriptAsync("shellMessage", new string[] { message });
        }

        private void InkPresenter_StrokesErased(Windows.UI.Input.Inking.InkPresenter sender, Windows.UI.Input.Inking.InkStrokesErasedEventArgs args)
        {
            foreach (InkStroke stroke in args.Strokes)
            {
                // Get index of removed stroke
                int index = this.strokeIds.IndexOf(stroke.Id);
                this.strokeIds.RemoveAt(index);
                sendMessage("strokeErased " + index.ToString());
            }
        }

        private void InkPresenter_StrokesCollected(Windows.UI.Input.Inking.InkPresenter sender, Windows.UI.Input.Inking.InkStrokesCollectedEventArgs args)
        {
            foreach (InkStroke stroke in args.Strokes)
            {
                string encoded = encodedStroke(stroke);
                this.strokeIds.Add(stroke.Id);
                sendMessage("strokeAdded " + encoded);
            }
        }

        private async void webView_NavigationCompleted(WebView sender, WebViewNavigationCompletedEventArgs args)
        {
        }

        private void populate(string message)
        {
            Stroke[] strokes = JsonConvert.DeserializeObject<Stroke[]>(message);
            this.strokeIds.Clear();
            this.InkCanvas.InkPresenter.StrokeContainer.Clear();
            foreach (Stroke stroke in strokes)
            {
                InkStroke inkStroke = decodedStroke(stroke.points);
                this.InkCanvas.InkPresenter.StrokeContainer.AddStroke(inkStroke);
                this.strokeIds.Add(inkStroke.Id);
            }
        }

        private void webView_ScriptNotify(object sender, NotifyEventArgs e)
        {
            if (e.Value == "hello")
            {
                Debug.WriteLine("browser connected");
            }
            else
            {
                var parts = e.Value.Split(' ');
                if (parts.Length > 0 && parts[0] == "deleteCanvas")
                {
                    this.InkCanvas.Visibility = Visibility.Collapsed;
                }
                else if (parts.Length > 0 && parts[0] == "populateCanvas")
                {
                    this.populate(parts[1]);
                }
                else if (parts.Length > 0 && parts[0] == "moveCanvas")
                {
                   this.InkCanvas.Visibility = Visibility.Visible;

                    double top = Convert.ToDouble(parts[1]);
                    double left = Convert.ToDouble(parts[2]);
                    double width = Convert.ToDouble(parts[3]);
                    double height = Convert.ToDouble(parts[4]);
                  this.InkCanvas.Width = width;
                  this.InkCanvas.Height = height;
                   this.InkCanvas.Margin = new Thickness(left, top, left + width, top + height);
                }
            }
        }

        private void InkCanvas_Loaded(object sender, RoutedEventArgs e)
        {

        }

        private void grid_Drop(object sender, DragEventArgs e)
        {
            Debug.WriteLine("dropped " + e.ToString());
        }

        private void grid_DragOver(object sender, DragEventArgs e)
        {
            Debug.WriteLine("over");
            e.AcceptedOperation = DataPackageOperation.Copy;
        }
    }
}
