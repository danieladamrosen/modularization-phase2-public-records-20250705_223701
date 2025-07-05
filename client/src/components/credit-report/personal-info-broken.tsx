import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  MapPin,
  Calendar,
  Shield,
  Phone,
  Briefcase,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

interface PersonalInfoProps {
  borrower: {
    '@_FirstName': string;
    '@_LastName': string;
    '@_MiddleName'?: string;
    '@_BirthDate': string;
    '@_SSN': string;
    '@_UnparsedName'?: string;
    _RESIDENCE: Array<{
      '@_StreetAddress': string;
      '@_City': string;
      '@_State': string;
      '@_PostalCode': string;
      '@BorrowerResidencyType': string;
    }>;
  };
  reportInfo: {
    '@CreditResponseID': string;
    '@CreditReportFirstIssuedDate': string;
  };
  onDisputeSaved?: (data: {
    reason: string;
    instruction: string;
    selectedItems: { [key: string]: boolean };
  }) => void;
  onHeaderReset?: () => void;
  initialSelections?: { [key: string]: boolean };
  initialDisputeData?: {
    reason: string;
    instruction: string;
    selectedItems: { [key: string]: boolean };
  } | null;
  forceExpanded?: boolean;
}

export function PersonalInfo({
  borrower,
  reportInfo, // eslint-disable-line @typescript-eslint/no-unused-vars
  onDisputeSaved,
  onHeaderReset, // eslint-disable-line @typescript-eslint/no-unused-vars
  initialSelections,
  initialDisputeData,
  forceExpanded,
}: PersonalInfoProps): JSX.Element {
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>(
    initialSelections || {}
  );
  const [selectedReason, setSelectedReason] = useState(initialDisputeData?.reason || '');
  const [selectedInstruction, setSelectedInstruction] = useState(initialDisputeData?.instruction || '');
  const [isDisputeSaved, setIsDisputeSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(forceExpanded || false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Data parsing functions
  const formatSSN = (ssn: string): string => {
    if (!ssn) return 'Not Available';
    return ssn.replace(/(\d{3})(\d{2})(\d{4})/, 'XXX-XX-$3');
  };

  const formatBirthDate = (birthDate: string): string => {
    if (!birthDate) return 'Not Available';
    const date = new Date(birthDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const parseMiddleName = (): string => {
    if (borrower['@_MiddleName']) return borrower['@_MiddleName'];
    if (borrower['@_UnparsedName']) {
      const parts = borrower['@_UnparsedName'].split(' ');
      if (parts.length >= 3) return parts[1];
    }
    return '';
  };

  const middleName = parseMiddleName();
  const fullName = `${borrower['@_FirstName']} ${borrower['@_LastName']}`;

  // Get employment and other info (placeholders for authentic data)
  const getEmploymentInfo = () => ({
    currentEmployer: 'Not Available',
    previousEmployer: 'Not Available',
  });

  const getAdditionalPersonalInfo = () => ({
    phoneNumbers: 'Not Available',
    formerNames: 'Not Available',
  });

  const { currentEmployer, previousEmployer } = getEmploymentInfo();
  const { phoneNumbers, formerNames } = getAdditionalPersonalInfo();

  // Create personal info items with duplicate filtering
  const rawPersonalInfoItems = [
    {
      id: 'name',
      label: 'Name',
      value: fullName,
      icon: User,
    },
    ...(middleName
      ? [
          {
            id: 'middlename',
            label: 'Middle Name/Initial',
            value: middleName,
            icon: User,
          },
        ]
      : []),
    {
      id: 'birthdate',
      label: 'Date of Birth',
      value: formatBirthDate(borrower['@_BirthDate']),
      icon: Calendar,
    },
    {
      id: 'ssn',
      label: 'Social Security Number',
      value: formatSSN(borrower['@_SSN']),
      icon: Shield,
    },
    ...(borrower._RESIDENCE || []).map((address, index) => ({
      id: index === 0 ? 'address' : 'previous-address',
      label: index === 0 ? 'Current Address' : 'Previous Address',
      value: `${address['@_StreetAddress']}, ${address['@_City']}, ${address['@_State']} ${address['@_PostalCode']}`,
      icon: MapPin,
    })),
    {
      id: 'phone',
      label: 'Phone Numbers',
      value: phoneNumbers,
      icon: Phone,
    },
    {
      id: 'former-names',
      label: 'Former Names/Aliases',
      value: formerNames,
      icon: User,
    },
    {
      id: 'current-employer',
      label: 'Current Employer',
      value: currentEmployer,
      icon: Briefcase,
    },
    {
      id: 'previous-employer',
      label: 'Previous Employer',
      value: previousEmployer,
      icon: Briefcase,
    },
  ];

  // Filter out duplicates using Set-based filtering
  const seen = new Set<string>();
  const allPersonalInfoItems = rawPersonalInfoItems.filter(item => {
    const key = `${item.label}-${item.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Helper functions
  const hasSelectedItems = Object.values(selectedItems).some(Boolean);

  const toggleSelection = (itemId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const calculatePersonalInfoItemsCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };

  const handleSelectAllPreviousAddresses = () => {
    if (!isOpen) {
      setIsOpen(true);
    }

    // Only select previous address items (exclude current address)
    const previousAddressItemIds: string[] = [];

    if (borrower._RESIDENCE?.[1]) {
      previousAddressItemIds.push(
        'transunion-previous-address',
        'equifax-previous-address',
        'experian-previous-address'
      );
    }

    const allPreviousAddressesSelected = previousAddressItemIds.every((itemId) => selectedItems[itemId]);
    const addressSelections: { [key: string]: boolean } = {};

    if (allPreviousAddressesSelected) {
      previousAddressItemIds.forEach((itemId) => {
        addressSelections[itemId] = false;
      });
    } else {
      previousAddressItemIds.forEach((itemId) => {
        addressSelections[itemId] = true;
      });
    }

    setSelectedItems((prev) => ({
      ...prev,
      ...addressSelections,
    }));
  };

  const handleSaveAndContinue = () => {
    if (onDisputeSaved) {
      onDisputeSaved({
        reason: selectedReason,
        instruction: selectedInstruction,
        selectedItems: selectedItems,
      });
    }
    setIsDisputeSaved(true);
    setTimeout(() => setIsOpen(false), 500);
  };

  // Personal info dispute reasons
  const personalInfoDisputeReasons = [
    'This personal information is incorrect',
    'This address is wrong or outdated',
    'This is not my information',
    'This information is incomplete',
    'This contains errors',
  ];

  // Personal info dispute instructions
  const personalInfoDisputeInstructions = [
    'Remove this incorrect information from my credit report immediately',
    'Update this information to reflect accurate details',
    'Delete this outdated information',
    'Correct this information as it is inaccurate',
    'Verify and update this information',
  ];

  // Show collapsed state when saved
  if (!isOpen && isDisputeSaved) {
    return (
      <Card className="border border-green-300 bg-green-50 transition-all duration-300">
        <CardHeader
          className="cursor-pointer transition-colors collapsed-box-height hover:bg-green-100"
          onClick={() => setIsOpen(true)}
        >
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-base font-semibold text-green-700 leading-5">
                  Personal Information – Disputes Saved
                </div>
                <div className="text-sm text-green-600 leading-4">
                  {calculatePersonalInfoItemsCount()} personal info items • {calculatePersonalInfoItemsCount()} bureau disputes saved
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-blue-600 flex-shrink-0" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Show collapsed state when not saved
  if (!isOpen) {
    return (
      <Card className="border border-gray-200 transition-all duration-300 hover:shadow-lg">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50"
          onClick={toggleOpen}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                PI
              </div>
              <div>
                <h3 className="text-lg font-bold">Personal Information</h3>
                <p className="text-sm text-gray-600">
                  Removing old personal info tied to bad accounts helps for deleting them.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">3 bureaus</span>
              <ChevronDown />
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Main expanded view
  return (
    <div className="mb-4" data-section="personal-info">
      <Card 
        className={`
          ${isDisputeSaved 
            ? 'border border-green-300 bg-green-50' 
            : hasSelectedItems 
              ? 'border border-gray-200 bg-white' 
              : 'border-2 border-gray-300'
          }
          transition-all duration-300 hover:shadow-lg
        `}
      >
        {/* Header - Using exact same structure as collapsed view */}
        <CardHeader
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              {isDisputeSaved ? (
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  PI
                </div>
              )}
              <div>
                <h3 className={`text-lg font-bold ${isDisputeSaved ? 'text-green-700' : 'text-gray-900'}`}>
                  {isDisputeSaved
                    ? 'Personal Information – Dispute Saved'
                    : 'Personal Information'}
                </h3>
                <p className={`text-sm ${isDisputeSaved ? 'text-green-600' : 'text-gray-600'}`}>
                  {isDisputeSaved
                    ? `${calculatePersonalInfoItemsCount()} personal info items • ${calculatePersonalInfoItemsCount()} bureau disputes saved`
                    : 'Removing old personal info tied to bad accounts helps for deleting them.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">3 bureaus</span>
              <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        {isOpen && (
          <CardContent
            className={`
              pt-5 rounded-b-lg px-4 md:px-6
              ${isDisputeSaved ? 'bg-green-50' : ''}
            `}
          >
            <div className="space-y-6">
              {/* Step 1: Choose personal information */}
              <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="circle-badge circle-badge-blue">1</div>
                    <span className="font-bold text-gray-800">
                      Choose personal information to dispute (optional)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 h-8 text-sm font-medium"
                    onClick={handleSelectAllPreviousAddresses}
                  >
                    Select All Previous Addresses
                  </Button>
                </div>
              </div>

              {/* Three Bureau Columns */}
              <div className={`${hasSelectedItems && !isDisputeSaved ? 'bg-rose-50 border border-rose-200 rounded-t-lg px-4 py-4 mt-2' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TransUnion Column */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-cyan-700">TransUnion</h3>
                  </div>
                  <div className="space-y-2">
                    {allPersonalInfoItems.map((item) => {
                      const IconComponent = item.icon;
                      const itemId = `transunion-${item.id}`;
                      const isSelected = selectedItems[itemId];

                      return (
                        <div
                          key={itemId}
                          className={`
                            ${isDisputeSaved && isSelected
                              ? 'border-3 border-green-500 bg-green-50'
                              : isSelected
                              ? 'border-3 border-red-500 bg-gray-50'
                              : 'border border-gray-200 bg-gray-50 hover:border-gray-300'
                            }
                            rounded p-3 cursor-pointer transition-all duration-200
                          `}
                          onClick={() => toggleSelection(itemId)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={() => toggleSelection(itemId)}
                              className="mt-2"
                            />
                            <IconComponent className="w-4 h-4 text-gray-600 mt-2 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm text-gray-900">{item.label}</div>
                              <div className="text-xs text-gray-600 break-words">{item.value}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Equifax Column */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-red-600">Equifax</h3>
                  </div>
                  <div className="space-y-2">
                    {allPersonalInfoItems.map((item) => {
                      const IconComponent = item.icon;
                      const itemId = `equifax-${item.id}`;
                      const isSelected = selectedItems[itemId];

                      return (
                        <div
                          key={itemId}
                          className={`
                            ${isDisputeSaved && isSelected
                              ? 'border-3 border-green-500 bg-green-50'
                              : isSelected
                              ? 'border-3 border-red-500 bg-gray-50'
                              : 'border border-gray-200 bg-gray-50 hover:border-gray-300'
                            }
                            rounded p-3 cursor-pointer transition-all duration-200
                          `}
                          onClick={() => toggleSelection(itemId)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={() => toggleSelection(itemId)}
                              className="mt-2"
                            />
                            <IconComponent className="w-4 h-4 text-gray-600 mt-2 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm text-gray-900">{item.label}</div>
                              <div className="text-xs text-gray-600 break-words">{item.value}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Experian Column */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-blue-800">Experian</h3>
                  </div>
                  <div className="space-y-2">
                    {allPersonalInfoItems.map((item) => {
                      const IconComponent = item.icon;
                      const itemId = `experian-${item.id}`;
                      const isSelected = selectedItems[itemId];

                      return (
                        <div
                          key={itemId}
                          className={`
                            ${isDisputeSaved && isSelected
                              ? 'border-3 border-green-500 bg-green-50'
                              : isSelected
                              ? 'border-3 border-red-500 bg-gray-50'
                              : 'border border-gray-200 bg-gray-50 hover:border-gray-300'
                            }
                            rounded p-3 cursor-pointer transition-all duration-200
                          `}
                          onClick={() => toggleSelection(itemId)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={() => toggleSelection(itemId)}
                              className="mt-2"
                            />
                            <IconComponent className="w-4 h-4 text-gray-600 mt-2 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm text-gray-900">{item.label}</div>
                              <div className="text-xs text-gray-600 break-words">{item.value}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>

                {/* Dispute Module - Inside the pink wrapper */}
                {hasSelectedItems && (
                  <div>
                    <div className="border-t border-gray-200 mt-4 mb-4"></div>
                    <div className={`py-4 ${isDisputeSaved ? 'bg-green-50' : ''}`}>
                    <div className="flex items-start gap-2 mb-4 mt-2">
                      <div
                        className={`transition-colors duration-300 ${
                          isDisputeSaved ? 'circle-badge-green' : 'circle-badge-blue'
                        }`}
                      >
                        2
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {isDisputeSaved ? 'Dispute Saved' : 'Create Dispute'}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {/* Reason Selection */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700">Dispute Reason</label>
                        </div>
                        <Select value={selectedReason} onValueChange={setSelectedReason}>
                          <SelectTrigger
                            className={`w-full text-left ${
                              isDisputeSaved && hasSelectedItems
                                ? 'border-green-500'
                                : hasSelectedItems
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                            }`}
                          >
                            <SelectValue placeholder="Select a dispute reason..." />
                          </SelectTrigger>
                          <SelectContent>
                            {personalInfoDisputeReasons.map((reasonOption, index) => (
                              <SelectItem key={index} value={reasonOption}>
                                {reasonOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Instruction Selection */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700">Dispute Instruction</label>
                        </div>
                        <Select value={selectedInstruction} onValueChange={setSelectedInstruction}>
                          <SelectTrigger
                            className={`w-full text-left ${
                              isDisputeSaved && hasSelectedItems
                                ? 'border-green-500'
                                : hasSelectedItems
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                            }`}
                          >
                            <SelectValue placeholder="Select dispute instructions..." />
                          </SelectTrigger>
                          <SelectContent>
                            {personalInfoDisputeInstructions.map((instructionOption, index) => (
                              <SelectItem key={index} value={instructionOption}>
                                {instructionOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Save Button Section */}
                    <div className="flex gap-2 justify-between items-center pt-4">
                      {hasSelectedItems && !isDisputeSaved ? (
                        <div className="warning-container">
                          <AlertTriangle className="hidden md:block w-4 h-4 warning-icon" />
                          <span className="text-xs md:text-sm font-medium warning-text">
                            <span className="md:hidden">Complete<br />& Save</span>
                            <span className="hidden md:inline">Complete Reason & Instruction</span>
                          </span>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      <div className="flex items-center gap-2 relative overflow-visible">
                        <span
                          className={`mr-1 transition-colors duration-300 ${
                            isDisputeSaved ? 'circle-badge-green' : 'circle-badge-blue'
                          }`}
                        >
                          3
                        </span>
                        <Button
                          onClick={handleSaveAndContinue}
                          disabled={!hasSelectedItems || !selectedReason || !selectedInstruction}
                          className={`${
                            isDisputeSaved
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white px-4 py-2 rounded-md disabled:bg-gray-400 transition-colors duration-200 w-[190px] h-10 flex items-center justify-center`}
                        >
                          {isDisputeSaved ? (
                            <>
                              <span className="text-white text-sm mr-2">✓</span>
                              <span>Dispute Saved</span>
                            </>
                          ) : (
                            'Save Dispute and Continue'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}