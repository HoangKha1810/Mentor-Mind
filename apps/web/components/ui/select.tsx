'use client';

import { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'group motion-field flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-slate-400/30 bg-surface/75 px-3.5 text-left text-sm text-foreground outline-none transition-[border-color,background-color,box-shadow] duration-200 hover:border-slate-400/50 focus-visible:border-success/60 focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-success/15 data-[placeholder]:text-mutedText disabled:cursor-not-allowed disabled:opacity-55 dark:border-white/10 dark:bg-white/[0.055] dark:hover:border-white/20 dark:focus-visible:bg-white/[0.075] [&>span]:min-w-0 [&>span]:truncate',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 shrink-0 text-mutedText transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectScrollUpButton = forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex h-7 cursor-default items-center justify-center text-mutedText', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

export const SelectScrollDownButton = forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex h-7 cursor-default items-center justify-center text-mutedText', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

export const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', sideOffset = 6, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={sideOffset}
      className={cn(
        'relative z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[10rem] overflow-hidden rounded-lg border border-slate-400/35 bg-surface/95 text-foreground shadow-[0_18px_50px_rgba(2,8,23,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl data-[state=closed]:animate-none data-[state=open]:animate-none dark:border-white/12 dark:shadow-[0_18px_50px_rgba(2,8,23,0.42),inset_0_1px_0_rgba(255,255,255,0.08)]',
        position === 'popper' &&
          'w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-0 data-[side=top]:-translate-y-0',
        className,
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className={cn('p-1.5', position === 'popper' && 'w-full')}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectLabel = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2.5 py-1.5 text-xs font-semibold text-mutedText', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex min-h-10 w-full cursor-default select-none items-center rounded-md py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:bg-secondary/12 focus:text-foreground data-[highlighted]:bg-secondary/12 data-[highlighted]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[state=checked]:bg-success/12 data-[state=checked]:font-semibold data-[state=checked]:text-foreground',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center text-success">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectSeparator = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-white/10', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
