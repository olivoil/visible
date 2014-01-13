
build: index.js components
	@component build --dev

visible.js: components
	@component build --standalone visible --name visible --out .

components: component.json
	@component install --dev

clean:
	rm -fr build components

test: build
	open test/index.html

.PHONY: clean visible.js test
