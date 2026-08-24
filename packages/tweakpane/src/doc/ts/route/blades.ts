import {FpsGraphBladeApi, ListBladeApi, Pane, TextBladeApi} from 'tweakpane';

import {selectContainer} from '../util.js';

export function initBlades() {
	const markerToFnMap: {
		[key: string]: (container: HTMLElement) => void;
	} = {
		blade(container) {
			const pane = new Pane({
				container: container,
			});
			pane.addBlade({
				view: 'slider',
				label: 'brightness',
				min: 0,
				max: 1,
				value: 0.5,
			});
		},
		text(container) {
			const pane = new Pane({
				container: container,
			});
			pane.addBlade({
				view: 'text',

				label: 'name',
				parse: (v: unknown) => String(v),
				value: 'sketch-01',
			});
		},
		list(container) {
			const conPane = new Pane({
				container: selectContainer('list', true),
			});
			conPane.addBlade({
				view: 'text',
				label: 'value',
				parse: (v: unknown) => String(v),
				value: 'LDG',
			});

			const pane = new Pane({
				container: container,
			});
			const api = pane.addBlade({
				view: 'list',
				label: 'scene',
				options: [
					{text: 'loading', value: 'LDG'},
					{text: 'menu', value: 'MNU'},
					{text: 'field', value: 'FLD'},
				],
				value: 'LDG',
			}) as ListBladeApi<string>;
			api.on('change', (ev) => {
				(conPane.children[0] as TextBladeApi<string>).value = ev.value;
				conPane.refresh();
			});
		},
		slider(container) {
			const pane = new Pane({
				container: container,
			});
			pane.addBlade({
				view: 'slider',
				label: 'brightness',
				min: 0,
				max: 1,
				value: 0.5,
			});
		},
		separator: (container) => {
			const pane = new Pane({
				container: container,
			});
			pane.addButton({title: 'Previous'});
			pane.addButton({title: 'Next'});
			pane.addBlade({view: 'separator'});
			pane.addButton({title: 'Reset'});
		},
		buttongrid(container) {
			const pane = new Pane({
				container: container,
			});
			pane.addBlade({
				view: 'buttongrid',
				size: [3, 3],
				cells: (x: number, y: number) => ({
					title: [
						['NW', 'N', 'NE'],
						['W', '*', 'E'],
						['SW', 'S', 'SE'],
					][y][x],
				}),
				label: 'nav',
			});
		},
		cubicbezier(container) {
			const pane = new Pane({
				container: container,
			});
			pane.addBlade({
				view: 'cubicbezier',
				value: [0.5, 0, 0.5, 1],

				expanded: true,
				label: 'easing',
				picker: 'inline',
			});
		},
		fpsgraph(container) {
			const pane = new Pane({
				container: container,
			});
			const fpsGraph = pane.addBlade({
				view: 'fpsgraph',
				label: 'fpsgraph',
				rows: 2,
			}) as FpsGraphBladeApi;
			function render() {
				fpsGraph.begin();
				fpsGraph.end();
				requestAnimationFrame(render);
			}
			render();
		},
	};
	Object.keys(markerToFnMap).forEach((marker) => {
		const initFn = markerToFnMap[marker];
		const container = selectContainer(marker);
		initFn(container);
	});
}
