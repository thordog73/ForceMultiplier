import Capacitor
import UIKit

final class ForceMultiplierViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(FMFilesPlugin())
        webView?.isOpaque = false
        webView?.backgroundColor = UIColor(red: 19/255, green: 44/255, blue: 66/255, alpha: 1)
        webView?.scrollView.backgroundColor = webView?.backgroundColor
        webView?.scrollView.contentInsetAdjustmentBehavior = .never
    }

    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }
}
