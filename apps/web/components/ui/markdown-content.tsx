'use client';

import { memo, useId, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

const markdownComponents: Components = {
  p: ({ node: _node, className, ...props }) => (
    <p {...props} className={cn('mb-2 last:mb-0', className)} />
  ),
  h1: ({ node: _node, className, ...props }) => (
    <h3
      {...props}
      className={cn('mb-2 mt-4 text-lg font-semibold leading-7 first:mt-0', className)}
    />
  ),
  h2: ({ node: _node, className, ...props }) => (
    <h4
      {...props}
      className={cn('mb-2 mt-4 text-base font-semibold leading-6 first:mt-0', className)}
    />
  ),
  h3: ({ node: _node, className, ...props }) => (
    <h5
      {...props}
      className={cn('mb-1.5 mt-3 text-sm font-semibold leading-6 first:mt-0', className)}
    />
  ),
  ul: ({ node: _node, className, ...props }) => (
    <ul
      {...props}
      className={cn(
        'mb-3 list-disc space-y-1 pl-5 marker:text-secondary last:mb-0 [&.contains-task-list]:list-none [&.contains-task-list]:pl-0',
        className,
      )}
    />
  ),
  ol: ({ node: _node, className, ...props }) => (
    <ol
      {...props}
      className={cn(
        'mb-3 list-decimal space-y-1 pl-5 marker:font-semibold marker:text-secondary last:mb-0',
        className,
      )}
    />
  ),
  li: ({ node: _node, className, ...props }) => (
    <li
      {...props}
      className={cn(
        'pl-0.5 [&.task-list-item]:flex [&.task-list-item]:items-start [&.task-list-item]:gap-2 [&.task-list-item]:pl-0 [&_input]:mt-1.5 [&_input]:accent-secondary',
        className,
      )}
    />
  ),
  strong: ({ node: _node, className, ...props }) => (
    <strong {...props} className={cn('font-semibold text-white', className)} />
  ),
  em: ({ node: _node, className, ...props }) => (
    <em {...props} className={cn('text-slate-100', className)} />
  ),
  blockquote: ({ node: _node, className, ...props }) => (
    <blockquote
      {...props}
      className={cn(
        'my-3 border-l-2 border-secondary/60 bg-secondary/[0.06] px-3 py-2 text-slate-300',
        className,
      )}
    />
  ),
  a: ({ node: _node, href, className, ...props }) => {
    const external = Boolean(href && /^https?:\/\//i.test(href));
    return (
      <a
        {...props}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer noopener' : undefined}
        className={cn(
          'font-medium text-secondary underline decoration-secondary/35 underline-offset-4 transition hover:text-white hover:decoration-white/60',
          className,
        )}
      />
    );
  },
  img: () => null,
  code: ({ node: _node, className: codeClassName, ...props }) => (
    <code
      {...props}
      className={cn(
        'rounded bg-secondary/10 px-1.5 py-0.5 font-mono text-[0.86em] text-cyan-100',
        codeClassName,
      )}
    />
  ),
  pre: ({ node: _node, className, ...props }) => (
    <pre
      {...props}
      className={cn(
        'my-3 max-w-full overflow-x-auto rounded-lg border border-white/10 bg-[#050d18] p-3 font-mono text-xs leading-6 text-cyan-50 shadow-inner [&_code]:bg-transparent [&_code]:p-0',
        className,
      )}
    />
  ),
  table: ({ node: _node, className, ...props }) => (
    <div className="my-3 max-w-full overflow-x-auto rounded-lg border border-white/10">
      <table
        {...props}
        className={cn('w-full min-w-[28rem] border-collapse text-left text-xs', className)}
      />
    </div>
  ),
  th: ({ node: _node, className, ...props }) => (
    <th
      {...props}
      className={cn(
        'border-b border-white/10 bg-white/[0.06] px-3 py-2 font-semibold text-white',
        className,
      )}
    />
  ),
  td: ({ node: _node, className, ...props }) => (
    <td
      {...props}
      className={cn(
        'border-b border-white/[0.06] px-3 py-2 align-top text-slate-300 last:border-b-0',
        className,
      )}
    />
  ),
  hr: ({ node: _node, className, ...props }) => (
    <hr {...props} className={cn('my-4 border-white/10', className)} />
  ),
};

export const MarkdownContent = memo(function MarkdownContent({
  children,
  className,
  compact = false,
}: {
  children: string;
  className?: string;
  compact?: boolean;
}) {
  const instanceId = useId().replace(/:/g, '');
  const footnoteLabelId = `mentormind-${instanceId}-footnote-label`;
  const remarkRehypeOptions = useMemo(
    () => ({ clobberPrefix: `mentormind-${instanceId}-` }),
    [instanceId],
  );
  const instanceComponents = useMemo<Components>(
    () => ({
      ...markdownComponents,
      h2: ({ node: _node, className: headingClassName, id, ...props }) => (
        <h4
          {...props}
          id={id === 'footnote-label' ? footnoteLabelId : id}
          className={cn('mb-2 mt-4 text-base font-semibold leading-6 first:mt-0', headingClassName)}
        />
      ),
      a: ({
        node: _node,
        href,
        className: linkClassName,
        'aria-describedby': describedBy,
        ...props
      }) => {
        const external = Boolean(href && /^https?:\/\//i.test(href));
        return (
          <a
            {...props}
            href={href}
            aria-describedby={describedBy === 'footnote-label' ? footnoteLabelId : describedBy}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer noopener' : undefined}
            className={cn(
              'font-medium text-secondary underline decoration-secondary/35 underline-offset-4 transition hover:text-white hover:decoration-white/60',
              linkClassName,
            )}
          />
        );
      },
    }),
    [footnoteLabelId],
  );

  return (
    <div
      className={cn(
        'min-w-0 max-w-full overflow-hidden break-words text-current',
        compact ? 'text-sm leading-6' : 'text-sm leading-7',
        className,
      )}
    >
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm, remarkBreaks]}
        remarkRehypeOptions={remarkRehypeOptions}
        components={instanceComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});
