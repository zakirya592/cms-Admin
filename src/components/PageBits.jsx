export function PageHeader({ kicker, title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="inline-block px-2.5 py-0.5 rounded-full bg-amber-900/5 border border-amber-900/10 backdrop-blur-xs text-[11px] font-medium tracking-[0.2em] text-amber-900/90 uppercase ">
          {kicker}
        </p>
        <h1 className="font-serif mt-2 text-4xl leading-none text-ink tracking-tight">{title}</h1>
        {typeof description === "string" && /<[a-z][\s\S]*>/i.test(description) ? (
          <div className="rich-text-view mt-2 max-w-2xl text-sm whitespace-normal wrap-break-word text-stone-600" dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <p className="mt-2 max-w-2xl text-sm text-stone-600 leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
