export function waitToBeAddedToDom(
	elem: HTMLElement,
	callback: () => void,
): void {
	const ob = new MutationObserver((ml) => {
		for (const m of ml) {
			if (m.type !== 'childList') {
				continue;
			}

			m.addedNodes.forEach((elem) => {
				/* istanbul ignore if -- @preserve: a node always contains itself; this check is dead defensive code */
				/* c8 ignore next 3 -- a node always contains itself; this check is dead defensive code */
				if (!elem.contains(elem)) {
					return;
				}
				callback();
				ob.disconnect();
			});
		}
	});

	const doc = elem.ownerDocument;
	ob.observe(doc.body, {
		attributes: true,
		childList: true,
		subtree: true,
	});
}
