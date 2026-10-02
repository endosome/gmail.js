/**
 * @jest-environment jsdom
 */
"use strict";
let assert = require("assert");
let Gmail = require("../src/gmail").Gmail;

// Exercise the jQuery-backed DOM helpers against every supported jQuery major version.
const jqueryVersions = {
    "jQuery 3": "jquery3",
    "jQuery 4": "jquery4"
};

const fixture = `
  <div class="G-Ni J-J5-Ji" id="toolbar"></div>
  <div class="M9" id="compose"><div contenteditable="true" id="compose-body"></div></div>
  <div class="adn" data-legacy-message-id="abc123">
    <span class="hb" id="to-wrapper"></span>
    <div class="a3s" id="email-body"></div>
  </div>
  <div class="b8 UC"><div class="vh" id="infobox"></div></div>
`;

for (const [label, moduleName] of Object.entries(jqueryVersions)) {
    describe("DOM helpers with " + label, () => {
        const $ = require(moduleName);
        let gmail;

        beforeEach(() => {
            document.body.innerHTML = fixture;
            gmail = new Gmail($);
        });

        it("uses the expected jQuery major version", () => {
            assert.strictEqual($.fn.jquery[0], label.slice(-1));
        });

        it("add_modal_window renders title and content HTML", () => {
            gmail.tools.add_modal_window("Title <i>x</i>", "<b>hello</b>", () => {});
            assert.strictEqual($("#gmailJsModalWindowTitle i").length, 1);
            assert.strictEqual($("#gmailJsModalWindowContent b").text(), "hello");

            gmail.tools.remove_modal_window();
            assert.strictEqual($("#gmailJsModalWindow").length, 0);
        });

        it("add_toolbar_button inserts a clickable button", () => {
            let clicked = 0;
            gmail.dom.toolbar = () => $("#toolbar");
            gmail.tools.add_toolbar_button("<span class='label'>Btn</span>", () => clicked++, "custom");

            const label = $("#toolbar .label");
            assert.strictEqual(label.length, 1);
            label.parent().get(0).click();
            assert.strictEqual(clicked, 1);
        });

        it("compose body() sets and gets HTML", () => {
            const compose = gmail.dom.compose($("#compose"));
            compose.body("<p>new body</p>");
            assert.strictEqual($("#compose-body p").text(), "new body");
            assert.strictEqual(compose.body(), "<p>new body</p>");
        });

        it("email body() sets and gets HTML", () => {
            const email = gmail.dom.email($("div.adn"));
            email.body("<p>email body</p>");
            assert.strictEqual(email.body(), "<p>email body</p>");
        });

        it("email to() rewrites recipients", () => {
            const email = gmail.dom.email($("div.adn"));
            const result = email.to([
                { email: "a@example.com", name: "Alice" },
                { email: "b@example.com", name: "Bob" }
            ]);

            assert.deepStrictEqual(
                result.map(r => [r.email, r.name]),
                [["a@example.com", "Alice"], ["b@example.com", "Bob"]]
            );
            assert.strictEqual($("#to-wrapper").text(), "to Alice, Bob");
        });

        it("infobox renders HTML messages", () => {
            gmail.tools.infobox("<b>saved</b>", undefined, true);
            assert.strictEqual($("#infobox b").text(), "saved");
        });

        it("keeps jQuery 4 compatibility shims on chained results", () => {
            const chained = gmail.dom.compose($("#compose")).dom("body").parent().find("div");
            for (const method of ["size", "bind", "unbind", "delegate", "undelegate", "hover", "click", "load"]) {
                assert.strictEqual(typeof chained[method], "function", method);
            }
            assert.strictEqual(chained.size(), 1);

            let hovered = 0;
            chained.hover(() => hovered++);
            chained.trigger("mouseenter");
            assert.strictEqual(hovered, 1);
        });
    });
}
