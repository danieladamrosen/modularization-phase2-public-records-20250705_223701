interface CreditReportHeaderProps {
  onShowTutorial?: () => void;
  showInstructionalVideo?: boolean;
}

export function CreditReportHeader({ onShowTutorial, showInstructionalVideo }: CreditReportHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-gray-900">Credit Report Analysis</h1>
            </div>
            <div className="hidden md:block h-4 w-px bg-gray-300"></div>
            <span className="hidden md:block text-sm text-gray-600 font-medium">Donald Blair</span>
          </div>
        </div>
      </div>
    </header>
  );
}
