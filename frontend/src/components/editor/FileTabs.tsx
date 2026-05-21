type FileTabsProps = {
  activeFileName: string;
};

export function FileTabs({ activeFileName }: FileTabsProps) {
  return (
    <div className="file-tabs" aria-label="Open files">
      <button className="file-tab is-active" type="button" aria-current="page">
        {activeFileName}
      </button>
    </div>
  );
}
