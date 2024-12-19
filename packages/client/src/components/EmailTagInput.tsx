import { ValidationResult } from './TagInputs';

import { Tag, TagInputs } from '@/components/TagInputs';
import { isValidEmailFormat } from '@/util/isValidEmailFormat';
import { useState, useEffect } from 'react';

interface EmailTagInputProps {
  onChange?: (emails: Tag[]) => void;
  initialEmails?: Tag[];
  maxEmails?: number;
}

export function EmailTagInput({
  onChange,
  initialEmails = [],
  maxEmails,
}: EmailTagInputProps) {
  const [emails, setEmails] = useState<Tag[]>(initialEmails);

  useEffect(() => {
    setEmails(initialEmails);
  }, [initialEmails]);

  const validateEmail = (email: string): ValidationResult => {
    if (!isValidEmailFormat(email)) {
      return {
        isValid: false,
        error: 'Invalid email format',
      };
    }
    return {
      isValid: true,
      error: '',
    };
  };

  const formatEmail = (email: string): string => {
    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w\s@.+-]/g, '');
  };

  const handleEmailsChange = (newEmails: Tag[]): void => {
    setEmails(newEmails);
    onChange?.(newEmails);
  };

  return (
    <TagInputs
      tags={emails}
      onTagsChange={handleEmailsChange}
      validateTag={validateEmail}
      formatTag={formatEmail}
      placeholder="Add emails"
      itemName="email"
      maxTags={maxEmails}
    />
  );
}
