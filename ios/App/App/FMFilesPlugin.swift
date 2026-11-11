import Capacitor
import Foundation
import UIKit
import UniformTypeIdentifiers

/// Local files and system UI only. No server requests, accounts, or analytics.
@objc(FMFilesPlugin)
public final class FMFilesPlugin: CAPPlugin, CAPBridgedPlugin, UIDocumentPickerDelegate, UIAdaptivePresentationControllerDelegate {
    public let identifier = "FMFilesPlugin"
    public let jsName = "FMFiles"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "shareFile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "importFile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "copyText", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "printHTML", returnType: CAPPluginReturnPromise)
    ]
    private let maximumBytes = 8_000_000
    private var pendingImport: CAPPluginCall?

    private func isBundledPage(_ call: CAPPluginCall) -> Bool {
        guard let url = bridge?.webView?.url,
              url.scheme == "capacitor", url.host == "localhost" else {
            call.reject("This action is available only inside the bundled app.")
            return false
        }
        return true
    }

    private func presenter(for call: CAPPluginCall) -> UIViewController? {
        guard isBundledPage(call) else { return nil }
        guard let presenter = bridge?.viewController, presenter.presentedViewController == nil else {
            call.reject("Finish the open system window and try again.")
            return nil
        }
        return presenter
    }

    @objc public func shareFile(_ call: CAPPluginCall) {
        guard let content = call.getString("data"), let data = content.data(using: .utf8), data.count <= maximumBytes else {
            call.reject("Export must contain text smaller than 8 MB.")
            return
        }
        let input = call.getString("name") ?? "force-multiplier.json"
        let allowed = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-")
        var name = String(input.unicodeScalars.map { allowed.contains($0) ? Character($0) : "_" }.prefix(120))
        if name.isEmpty || name == "." || name == ".." { name = "force-multiplier.json" }
        DispatchQueue.main.async { [weak self] in
            guard let self, let presenter = self.presenter(for: call) else { return }
            let directory = FileManager.default.temporaryDirectory.appendingPathComponent("fm-export-" + UUID().uuidString, isDirectory: true)
            let url = directory.appendingPathComponent(name, isDirectory: false)
            do {
                try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
                try data.write(to: url, options: .atomic)
                let activity = UIActivityViewController(activityItems: [url], applicationActivities: nil)
                activity.popoverPresentationController?.sourceView = presenter.view
                activity.popoverPresentationController?.sourceRect = CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.maxY - 24, width: 1, height: 1)
                activity.completionWithItemsHandler = { _, completed, _, error in
                    try? FileManager.default.removeItem(at: directory)
                    if let error { call.reject("The file could not be shared.", nil, error) }
                    else { call.resolve(["completed": completed]) }
                }
                presenter.present(activity, animated: true)
            } catch {
                try? FileManager.default.removeItem(at: directory)
                call.reject("The export file could not be created.", nil, error)
            }
        }
    }

    @objc public func importFile(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self, let presenter = self.presenter(for: call) else { return }
            guard self.pendingImport == nil else { call.reject("An import is already open."); return }
            let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.json], asCopy: true)
            picker.allowsMultipleSelection = false
            picker.delegate = self
            self.pendingImport = call
            presenter.present(picker, animated: true)
            picker.presentationController?.delegate = self
        }
    }

    public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let call = pendingImport else { return }
        pendingImport = nil
        guard let url = urls.first else { call.resolve(["cancelled": true]); return }
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }
        do {
            let values = try url.resourceValues(forKeys: [.fileSizeKey])
            guard (values.fileSize ?? maximumBytes + 1) <= maximumBytes else { call.reject("This backup is larger than 8 MB."); return }
            let data = try Data(contentsOf: url, options: .mappedIfSafe)
            guard data.count <= maximumBytes, let content = String(data: data, encoding: .utf8) else {
                call.reject("Choose a UTF-8 JSON backup smaller than 8 MB."); return
            }
            // Schema validation and replacement confirmation belong to the existing UI.
            call.resolve(["name": url.lastPathComponent, "data": content, "cancelled": false])
        } catch { call.reject("The selected backup could not be read.", nil, error) }
    }

    public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) { cancelImport() }
    public func presentationControllerDidDismiss(_ presentationController: UIPresentationController) { cancelImport() }
    private func cancelImport() {
        pendingImport?.resolve(["cancelled": true])
        pendingImport = nil
    }

    @objc public func copyText(_ call: CAPPluginCall) {
        guard let text = call.getString("text"), text.utf8.count <= maximumBytes else { call.reject("Text is missing or too large."); return }
        DispatchQueue.main.async { [weak self] in
            guard let self, self.isBundledPage(call) else { return }
            // localOnly avoids automatically handing copied learner notes to other devices.
            UIPasteboard.general.setItems([[UTType.utf8PlainText.identifier: text]], options: [.localOnly: true])
            call.resolve()
        }
    }

    @objc public func printHTML(_ call: CAPPluginCall) {
        guard let html = call.getString("html"), html.utf8.count <= maximumBytes else { call.reject("The printable document is missing or too large."); return }
        DispatchQueue.main.async { [weak self] in
            guard let self, let presenter = self.presenter(for: call) else { return }
            guard UIPrintInteractionController.isPrintingAvailable else { call.reject("Printing is unavailable on this device."); return }
            let printer = UIPrintInteractionController.shared
            let info = UIPrintInfo(dictionary: nil)
            info.jobName = call.getString("title") ?? "Force Multiplier"
            info.outputType = .general
            printer.printInfo = info
            printer.printFormatter = UIMarkupTextPrintFormatter(markupText: html)
            let completion: UIPrintInteractionController.CompletionHandler = { _, completed, error in
                if let error { call.reject("The document could not be printed.", nil, error) }
                else { call.resolve(["completed": completed]) }
            }
            if UIDevice.current.userInterfaceIdiom == .pad {
                printer.present(from: CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.maxY - 24, width: 1, height: 1), in: presenter.view, animated: true, completionHandler: completion)
            } else {
                printer.present(animated: true, completionHandler: completion)
            }
        }
    }
}
