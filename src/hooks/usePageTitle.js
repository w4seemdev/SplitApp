import { useEffect } from 'react'

// Sets the document title for a page, e.g. usePageTitle('Tracker')
// -> "Tracker — SplitApp". Falls back to the default app title.
// Exported both ways: pages import it as default and as a named import.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — SplitApp` : 'SplitApp — Build Muscle With a Plan'
  }, [title])
}

export default usePageTitle
