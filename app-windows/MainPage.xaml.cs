using Windows.ApplicationModel.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace Shell
{
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
            var coretitleBar = CoreApplication.GetCurrentView().TitleBar;
            coretitleBar.ExtendViewIntoTitleBar = true;
            coretitleBar.LayoutMetricsChanged += CoreTitleBar_LayoutMetricsChanged;

            Window.Current.SetTitleBar(CustomDragRegion);
        }

        private void CoreTitleBar_LayoutMetricsChanged(CoreApplicationViewTitleBar sender, object args)
        {
            if (FlowDirection == Windows.UI.Xaml.FlowDirection.LeftToRight)
            {
                CustomDragRegion.MinWidth = sender.SystemOverlayRightInset;
                ShellTitlebarInset.MinWidth = sender.SystemOverlayLeftInset;
            } else
            {
                CustomDragRegion.MinWidth = sender.SystemOverlayLeftInset;
                ShellTitlebarInset.MinWidth = sender.SystemOverlayRightInset;
            }

            CustomDragRegion.Height = ShellTitlebarInset.Height = sender.Height;
        }

        private void Tabs_AddTabButtonClick(TabView sender, object args)
        {
            var newTab = new TabViewItem();
            newTab.IconSource = new Microsoft.UI.Xaml.Controls.SymbolIconSource() {
                Symbol = Symbol.Document
            };
            newTab.Header = "??";

            WebView frame = new WebView();
            frame.NavigateToString("http://localhost:3000");
            newTab.Content = frame;

            sender.TabItems.Add(newTab);
        }

        private void Tabs_TabCloseRequested(TabView sender, TabViewTabCloseRequestedEventArgs args)
        {
            sender.TabItems.Remove(args.Tab);
        }
    }

}
