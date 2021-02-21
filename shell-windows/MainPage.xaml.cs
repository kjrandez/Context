using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace shell_windows
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
            Debug.WriteLine("Testing...");
        }

        private async void webView_NavigationCompleted(WebView sender, WebViewNavigationCompletedEventArgs args)
        {
            //await this.webView.InvokeScriptAsync("testFun", new string[] {"haha"});
        }

        private void webView_ScriptNotify(object sender, NotifyEventArgs e)
        {
            Debug.WriteLine(e.Value);
            if (e.Value == "hello")
            {
                Debug.WriteLine("browser connected");
                //this.webView.InvokeScriptAsync("shellMessage", new string[] { "message" });
            }
            else
            {
                var parts = e.Value.Split(' ');
                if (parts.Length > 0 && parts[0] == "deleteCanvas")
                {

                }
                else if (parts.Length > 0 && parts[0] == "moveCanvas")
                {
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

        private void scrollViewer_ViewChanging(object sender, ScrollViewerViewChangingEventArgs e)
        {
            Debug.WriteLine("scroll changing");
        }

        private void scrollViewer_ViewChanged(object sender, ScrollViewerViewChangedEventArgs e)
        {
            Debug.WriteLine("scroll changed");
        }
    }
}
