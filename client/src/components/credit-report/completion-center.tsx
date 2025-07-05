// Removed unused useState import
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface CompletionCenterProps {
  onContinueToWizard: () => void;
  onShowDisputeItems: () => void;
}

export function CompletionCenter({
  onContinueToWizard,
  onShowDisputeItems,
}: CompletionCenterProps) {
  return (
    <section id="completion">
      <Card className="border border-green-500 bg-gradient-to-br from-white to-gray-50 mx-auto max-w-2xl md:max-w-none md:mx-0 shadow-lg">
        <CardContent className="p-6 sm:p-8 md:p-12">
          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Complete</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                <span className="font-semibold">Ready to proceed?</span> All negative items tagged
                with reason and instruction will be saved as disputes for future letters.
              </p>
            </div>

            <div className="flex justify-center gap-6 max-w-4xl mx-auto">
              <Button
                onClick={onContinueToWizard}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-w-[280px] flex items-center justify-center"
              >
                Save Work & Continue to Wizard
              </Button>

              <Button
                onClick={onShowDisputeItems}
                variant="outline"
                className="border border-green-600 text-green-700 hover:bg-green-50 hover:text-green-700 px-8 py-4 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-w-[280px] flex items-center justify-center"
              >
                Save Work & Show All Disputes
              </Button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="text-center">
              <div className="w-14 h-14 bg-green-600 rounded-full flex-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4">Review Complete</h2>

              <p className="text-base text-gray-700 mb-8 leading-relaxed px-2">
                <span className="font-semibold">Ready to proceed?</span> All negative items tagged
                with reason and instruction will be saved as disputes for future letters.
              </p>

              <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                <Button
                  onClick={onContinueToWizard}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 w-full flex items-center justify-center"
                >
                  Continue to Wizard
                </Button>

                <Button
                  onClick={onShowDisputeItems}
                  variant="outline"
                  className="btn-green-outline w-full flex items-center justify-center"
                >
                  Show All Disputes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
