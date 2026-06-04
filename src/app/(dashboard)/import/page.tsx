import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AmazonCSVImport } from "@/components/import/AmazonCSVImport";

export default function ImportPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Import Amazon Orders</h1>
        <p className="text-slate-500 mt-1">
          Upload your Amazon order history CSV to instantly import all past purchases
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to get your Amazon order history</CardTitle>
          <CardDescription>Follow these steps to download your order history CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {[
              { step: "1", text: 'Go to amazon.com and click "Returns & Orders"' },
              { step: "2", text: 'Click "Download order reports" at the top of the page' },
              { step: "3", text: "Select your date range (you can go back years)" },
              { step: "4", text: 'Click "Request Report" — Amazon will email you the file' },
              { step: "5", text: "Download the CSV and upload it below" },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <span className="text-sm text-slate-600">{text}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload CSV File</CardTitle>
          <CardDescription>
            Your data is processed securely. Order IDs are used to prevent duplicate imports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AmazonCSVImport />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-indigo-600">$0</p>
              <p className="text-xs text-slate-500 mt-1">No extra cost — structured data, no AI needed</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-indigo-600">Instant</p>
              <p className="text-xs text-slate-500 mt-1">Orders appear in your dashboard immediately</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-indigo-600">Safe</p>
              <p className="text-xs text-slate-500 mt-1">Duplicate orders automatically skipped</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
