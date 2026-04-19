import { on } from 'svelte/events';

export function codeInput(node: HTMLElement) {
	const previous = document.activeElement as HTMLInputElement;

	function focusable() {
		return Array.from(node.querySelectorAll('input'));
	}

	function handleInputChange() {
		const current = document.activeElement as HTMLInputElement;
		if (current.value.length == 0) return;

		const elements = focusable();
		const currentIndex = elements.indexOf(current);
		if (currentIndex == elements.length - 1) return;
		const nextIndex = (currentIndex + 1) % elements.length;
		const targetElement = elements.at(nextIndex);
		if (targetElement) {
			targetElement.focus();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		const current = document.activeElement as HTMLInputElement;
		const elements = focusable();
		const currentIndex = elements.indexOf(current);
		let step;

		if (event.key == 'Tab') {
			step = event.shiftKey ? -1 : 1;
		}

		if (event.key == 'Backspace' && current.value.length == 0) {
			step = currentIndex == 0 ? 0 : -1;
		}

		if (step) {
			const nextIndex = (currentIndex + step) % elements.length;
			const targetElement = elements.at(nextIndex);
			if (targetElement) {
				targetElement.focus();
				event.preventDefault();
			}
		}
	}

	function handlePaste(event: ClipboardEvent) {
		const paste = event.clipboardData?.getData('text');
		if (!paste) return;

		const digits = paste
			.split('')
			.filter((char) => /\d/.test(char))
			.slice(0, 6);
		const elements = focusable();

		digits.forEach((digit, i) => {
			if (elements[i]) {
				elements[i].value = digit;
			}
		});

		const lastIndex = Math.min(digits.length, elements.length) - 1;
		if (lastIndex >= 0) {
			elements[lastIndex].focus();
		}
		event.preventDefault();
	}

	const offFocusin = focusable().map((el) => on(el, 'focusin', () => el.select()));

	focusable()[0].focus();
	const offInput = on(node, 'input', handleInputChange);
	const offKeydown = on(node, 'keydown', handleKeydown);
	const offPaste = on(node, 'paste', handlePaste);

	return () => {
		offInput();
		offKeydown();
		offPaste();
		offFocusin.forEach((off) => off());
		previous.focus();
	};
}
