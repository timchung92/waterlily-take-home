import React, {
  useState,
  useRef,
  KeyboardEvent,
  ClipboardEvent,
  ChangeEvent,
  useEffect,
} from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Plus, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Alert } from './ui/alert';
import { cn } from '@/lib/utils';

interface ValidationResult {
  isValid: boolean;
  error: string;
}

interface Tag {
  value: string;
  isValid: boolean;
  error: string;
}

interface TagInputProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  validateTag: (value: string) => ValidationResult;
  formatTag: (value: string) => string;
  placeholder: string;
  plusIcon?: React.ReactNode;
  separator?: RegExp;
  itemName?: string;
  maxTags?: number;
}

export function TagInputs({
  tags,
  onTagsChange,
  validateTag,
  formatTag,
  placeholder,
  itemName = 'tag',
  plusIcon = <Plus className="h-4 w-4 text-gray-500" />,
  separator = /[,\s\t]+/,
  maxTags,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [isInputActive, setIsInputActive] = useState(false);
  const [focusedTagIndex, setFocusedTagIndex] = useState<number>(-1);
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');
  const [maxTagWarning, setMaxTagWarning] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const hasReachedLimit = maxTags !== undefined && tags.length >= maxTags;

  useEffect(() => {
    if (inputContainerRef.current) {
      inputContainerRef.current.scrollLeft =
        inputContainerRef.current.scrollWidth;
    }
  }, [tags]);

  useEffect(() => {
    if (isInputActive) {
      inputRef.current?.focus();
    }
  }, [isInputActive]);

  useEffect(() => {
    if (!maxTags || tags.length < maxTags) {
      setMaxTagWarning('');
    }
  }, [tags.length, maxTags]);

  const isDuplicate = (newTag: string, existingTags: Tag[]): boolean => {
    const formattedNew = newTag.toLowerCase();
    return existingTags.some(tag => tag.value.toLowerCase() === formattedNew);
  };

  const processTags = (text: string): void => {
    if (hasReachedLimit) {
      setMaxTagWarning(`Maximum of ${maxTags} ${itemName}s allowed`);
      return;
    }

    const duplicates: string[] = [];
    const processedValues = new Set<string>();

    const newTags = text
      .split(separator)
      .map(tag => formatTag(tag))
      .filter(tag => tag.length > 0)
      .map(tag => {
        // Check against existing tags
        if (isDuplicate(tag, tags)) {
          duplicates.push(tag);
          return null;
        }

        // Check against other new tags being processed
        if (processedValues.has(tag.toLowerCase())) {
          duplicates.push(tag);
          return null;
        }

        processedValues.add(tag.toLowerCase());
        const validation = validateTag(tag);
        return {
          value: tag,
          isValid: validation.isValid,
          error: validation.error,
        };
      })
      .filter((tag): tag is Tag => tag !== null);

    if (duplicates.length > 0) {
      const duplicateList = [...new Set(duplicates)]
        .map(d => `${d}`)
        .join(', ');
      const message =
        duplicates.length === 1
          ? `${duplicateList} has already been added`
          : `${duplicateList} have already been added`;
      setDuplicateWarning(message);
    } else {
      setDuplicateWarning('');
    }

    // Limit the number of new tags if maxTags is set
    const availableSlots = maxTags ? maxTags - tags.length : newTags.length;
    const limitedNewTags = newTags.slice(0, availableSlots);

    if (maxTags && newTags.length > availableSlots) {
      setMaxTagWarning(`Maximum of ${maxTags} ${itemName}s allowed`);
    }

    onTagsChange([...tags, ...limitedNewTags]);
    setInputValue('');
    setFocusedTagIndex(-1);
  };

  const removeTag = (tagToRemove: string): void => {
    onTagsChange(tags.filter(tag => tag.value !== tagToRemove));
    setFocusedTagIndex(-1);
    setDuplicateWarning('');
    setMaxTagWarning('');
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    processTags(pastedText);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (
      (e.key === 'Enter' ||
        e.key === ',' ||
        e.key === ' ' ||
        e.key === 'Tab') &&
      inputValue.trim()
    ) {
      e.preventDefault();
      processTags(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '') {
      if (focusedTagIndex >= 0) {
        removeTag(tags[focusedTagIndex].value);
      } else {
        setFocusedTagIndex(tags.length - 1);
      }
    } else if (e.key === 'Tab' && inputValue.trim() === '') {
      if (tags.length > 0) {
        e.preventDefault();
        if (e.shiftKey) {
          setFocusedTagIndex(prev => (prev <= 0 ? tags.length - 1 : prev - 1));
        } else {
          setFocusedTagIndex(prev => (prev >= tags.length - 1 ? 0 : prev + 1));
        }
      }
    } else if (e.key === 'ArrowLeft' && inputValue === '') {
      setFocusedTagIndex(tags.length - 1);
    }
  };

  const handleTagKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    index: number,
  ): void => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      removeTag(tags[index].value);
      if (index > 0) {
        setFocusedTagIndex(index - 1);
      } else if (tags.length > 1) {
        setFocusedTagIndex(0);
      } else {
        inputRef.current?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index === tags.length - 1) {
        inputRef.current?.focus();
        setFocusedTagIndex(-1);
      } else {
        setFocusedTagIndex(index + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        setFocusedTagIndex(index - 1);
      }
    }
  };

  const handleInputBlur = () => {
    if (inputValue === '') {
      setIsInputActive(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="focus-within:ring-ring w-full rounded-lg border p-2 focus-within:ring-2 focus-within:ring-offset-2">
          <div
            ref={inputContainerRef}
            className="flex flex-wrap gap-2 overflow-x-auto p-2"
          >
            {tags.map((tag, index) => (
              <Tooltip key={tag.value}>
                <TooltipTrigger>
                  <Badge
                    variant={'secondary'}
                    className={cn(
                      'flex h-6 items-center gap-1 text-xs font-normal md:text-sm',
                      focusedTagIndex === index ? 'ring-ring ring-2' : '',
                      tag.isValid ? '' : ' bg-red-100 hover:bg-red-100',
                    )}
                    onKeyDown={e => handleTagKeyDown(e, index)}
                    onFocus={() => setFocusedTagIndex(index)}
                    tabIndex={0}
                  >
                    {tag.isValid ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X
                        className="hover:text-primary-foreground/80 h-3 w-3 cursor-pointer text-red-500"
                        onClick={() => removeTag(tag.value)}
                      />
                    )}
                    {tag.value}
                    <X
                      className="hover:text-primary-foreground/80 ml-1 h-3 w-3 cursor-pointer rounded-full bg-gray-400 p-[2px] text-white hover:bg-gray-500"
                      onClick={() => removeTag(tag.value)}
                    />
                  </Badge>
                </TooltipTrigger>
                {!tag.isValid && (
                  <TooltipContent>
                    <p>{tag.error}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
            {isInputActive ? (
              <div className="relative flex items-center">
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setInputValue(e.target.value)
                  }
                  onKeyDown={handleInputKeyDown}
                  onPaste={handlePaste}
                  onFocus={() => setFocusedTagIndex(-1)}
                  onBlur={handleInputBlur}
                  disabled={hasReachedLimit}
                  className="w-auto min-w-[200px] flex-grow border-0 p-0 pl-2 text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder={
                    hasReachedLimit
                      ? `Maximum ${maxTags} ${itemName}s reached`
                      : inputValue === ''
                        ? `Enter or paste multiple ${itemName}s`
                        : ''
                  }
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-7 gap-1 px-2"
                onClick={() => setIsInputActive(true)}
                disabled={hasReachedLimit}
              >
                {plusIcon}
                <span className="text-muted-foreground text-gray-500">
                  {hasReachedLimit
                    ? `Maximum ${maxTags} ${itemName}s reached`
                    : placeholder}
                </span>
              </Button>
            )}
          </div>
        </div>
        {duplicateWarning && (
          <Alert className="border-yellow-50 bg-yellow-50 text-sm text-yellow-500">
            {duplicateWarning}
          </Alert>
        )}
        {maxTagWarning && (
          <Alert className="border-yellow-50 bg-yellow-50 text-sm text-yellow-500">
            {maxTagWarning}
          </Alert>
        )}
        {tags.some(tag => !tag.isValid) && (
          <Alert className="border-red-50 bg-red-50 text-sm text-red-500">
            Invalid {itemName}s: {tags.filter(tag => !tag.isValid).length}
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
}

export type { Tag, ValidationResult, TagInputProps };
