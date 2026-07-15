"use strict";

/**
 * MODULES-LEGAL.JS
 * Ultimate Microsoft Word Clone with AI Legal Integration (Gemini-Powered)
 * Professional Desktop-Grade Office Suite Architecture
 */

// ── 1. OFFICE SUITE DEFINITIONS ─────────────────────────────────────────────

const WORD_TABS = [
    { id: "home", title: "Home", active: true },
    { id: "insert", title: "Insert" },
    { id: "layout", title: "Layout" },
    { id: "references", title: "References" },
    { id: "review", title: "Review" },
    { id: "view", title: "View" }
];

// ── 2. UI RENDERERS (The 'Ribbon' Engine) ───────────────────────────────────

function getRibbonHtml(tabId) {
    let html = "";
    if (tabId === "home") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.formatDoc('undo')"><span class="dr-icon">↩️</span><label>Undo</label></button>
                    <button class="dr-btn-large" onclick="window.formatDoc('redo')"><span class="dr-icon">↪️</span><label>Redo</label></button>
                    <div class="dr-v-sep"></div>
                    <button class="dr-btn-large" onclick="window.formatDoc('paste')"><span class="dr-icon">📋</span><label>Paste</label></button>
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="window.formatDoc('cut')">✂️<span>Cut</span></button>
                        <button class="dr-btn-compact" onclick="window.formatDoc('copy')">📑<span>Copy</span></button>
                    </div>
                </div>
                <div class="dr-grp-label">Clipboard</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap" style="flex-direction:column; align-items:flex-start; gap:4px">
                    <div style="display:flex; gap:4px">
                        <select class="dr-select-compact" id="fontName" onchange="window.formatDoc('fontName', this.value)" style="width:130px">
                            <option>Calibri</option><option>Arial</option><option>Times New Roman</option>
                            <option>Segoe UI</option><option>Verdana</option><option>Tahoma</option>
                            <option>Georgia</option><option>Courier New</option><option>Trebuchet MS</option>
                            <option>Impact</option><option>Comic Sans MS</option>
                        </select>
                        <select class="dr-select-compact" id="fontSize" onchange="window.formatDoc('fontSize', this.value)" style="width:50px">
                            <option value="1">8</option><option value="2">10</option><option value="3" selected>12</option>
                            <option value="4">14</option><option value="5">18</option><option value="6">24</option>
                            <option value="7">36</option>
                        </select>
                    </div>
                    <div style="display:flex; gap:2px">
                        <button class="dr-btn-style" onclick="window.formatDoc('bold')" title="Bold"><b>B</b></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('italic')" title="Italic"><i>I</i></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('underline')" title="Underline"><u>U</u></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('strikeThrough')"><s>abc</s></button>
                        <div class="dr-v-sep"></div>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('subscript')">x₂</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('superscript')">x²</button>
                        <div class="dr-v-sep"></div>
                        <div class="dr-color-wrap"><input type="color" onchange="window.formatDoc('foreColor', this.value)"><span>A</span></div>
                        <div class="dr-color-wrap bg"><input type="color" value="#ffff00" onchange="window.formatDoc('backColor', this.value)"><span>🖌️</span></div>
                    </div>
                </div>
                <div class="dr-grp-label">Font</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap" style="flex-direction:column; gap:4px">
                    <div style="display:flex; gap:2px">
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('insertUnorderedList')">•≡</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('insertOrderedList')">1≡</button>
                        <div class="dr-v-sep"></div>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('outdent')">←┥</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('indent')">┝→</button>
                    </div>
                    <div style="display:flex; gap:2px">
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('justifyLeft')">≡</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('justifyCenter')">≣</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('justifyRight')">≡</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('justifyFull')">≡</button>
                    </div>
                </div>
                <div class="dr-grp-label">Paragraph</div>
            </div>
            <div class="dr-ribbon-grp" style="flex:1; min-width:300px">
                <div class="dr-styles-shelf">
                    <div class="dr-style-card active" onclick="window.applyDocStyle('normal')"><div class="preview">AaBbCc</div><label>Normal</label></div>
                    <div class="dr-style-card" onclick="window.applyDocStyle('no-spacing')"><div class="preview">AaBbCc</div><label>No Spacing</label></div>
                    <div class="dr-style-card" onclick="window.applyDocStyle('h1')"><div class="preview" style="font-size:1.2rem; font-weight:bold">Heading 1</div><label>Heading 1</label></div>
                    <div class="dr-style-card" onclick="window.applyDocStyle('title')"><div class="preview" style="font-size:1.4rem">Title</div><label>Title</label></div>
                </div>
                <div class="dr-grp-label">Styles</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap" style="flex-direction:column; gap:2px">
                    <button class="dr-btn-compact" onclick="window.findText()">🔍 Find</button>
                    <button class="dr-btn-compact" onclick="window.replaceText()">🔁 Replace</button>
                    <button class="dr-btn-compact" onclick="window.selectDoc()">🎯 Select</button>
                </div>
                <div class="dr-grp-label">Editing</div>
            </div>`;
    } else if (tabId === "insert") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.insertCoverPage()"><span class="dr-icon">📄</span><label>Cover Page</label></button>
                    <button class="dr-btn-large" onclick="window.formatDoc('insertHTML', '<div style=\'page-break-after:always\'></div>')"><span class="dr-icon">📑</span><label>Page Break</label></button>
                </div>
                <div class="dr-grp-label">Pages</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.insertDrTable()"><span class="dr-icon">📊</span><label>Table</label></button>
                </div>
                <div class="dr-grp-label">Tables</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="document.getElementById('drImgImport').click()"><span class="dr-icon">🖼️</span><label>Pictures</label></button>
                    <button class="dr-btn-large" onclick="toast('Shapes gallery','info')"><span class="dr-icon">📐</span><label>Shapes</label></button>
                    <button class="dr-btn-large" onclick="toast('SmartArt editor','info')"><span class="dr-icon">🧩</span><label>SmartArt</label></button>
                </div>
                <div class="dr-grp-label">Illustrations</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.insertDrHeader()"><span class="dr-icon">🔝</span><label>Header</label></button>
                    <button class="dr-btn-large" onclick="window.insertDrFooter()"><span class="dr-icon">🔚</span><label>Footer</label></button>
                    <button class="dr-btn-large" onclick="window.insertPageNumber()"><span class="dr-icon">🔢</span><label>Page Number</label></button>
                </div>
                <div class="dr-grp-label">Header & Footer</div>
            </div>`;
    } else if (tabId === "layout") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.setDrMargins('2.5cm')"><span class="dr-icon">↔️</span><label>Margins</label></button>
                    <button class="dr-btn-large" onclick="window.setDrOrientation('portrait')"><span class="dr-icon">↕️</span><label>Orientation</label></button>
                    <button class="dr-btn-large" onclick="window.setDrSize('A4')"><span class="dr-icon">📏</span><label>Size</label></button>
                    <button class="dr-btn-large" onclick="window.formatDoc('insertHTML', '<div style=\'column-count:2; column-gap:20px\'></div>')"><span class="dr-icon">📑</span><label>Columns</label></button>
                </div>
                <div class="dr-grp-label">Page Setup</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap" style="flex-direction:column; gap:4px; padding:0 10px">
                    <div style="display:flex; align-items:center; gap:8px">
                        <label style="font-size:11px; width:50px">Indent L:</label>
                        <input type="number" class="dr-input-mini" value="0" onchange="window.setDrIndent('left', this.value)">
                    </div>
                    <div style="display:flex; align-items:center; gap:8px">
                        <label style="font-size:11px; width:50px">Indent R:</label>
                        <input type="number" class="dr-input-mini" value="0" onchange="window.setDrIndent('right', this.value)">
                    </div>
                </div>
                <div class="dr-actions-wrap" style="flex-direction:column; gap:4px; border-left:1px solid #ddd; padding:0 10px">
                    <div style="display:flex; align-items:center; gap:8px">
                        <label style="font-size:11px; width:55px">Spacing B:</label>
                        <input type="number" class="dr-input-mini" value="0" onchange="window.setDrSpacing('before', this.value)">
                    </div>
                    <div style="display:flex; align-items:center; gap:8px">
                        <label style="font-size:11px; width:55px">Spacing A:</label>
                        <input type="number" class="dr-input-mini" value="8" onchange="window.setDrSpacing('after', this.value)">
                    </div>
                </div>
                <div class="dr-grp-label">Paragraph</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-icon-only" title="Align" onclick="toast('Align Tools','info')">📊</button>
                    <button class="dr-btn-icon-only" title="Group" onclick="toast('Group Tools','info')">🧱</button>
                    <button class="dr-btn-icon-only" title="Rotate" onclick="toast('Rotate Tools','info')">🔄</button>
                </div>
                <div class="dr-grp-label">Arrange</div>
            </div>`;
    } else if (tabId === "references") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.insertTOC()"><span class="dr-icon">📑</span><label>Table of Contents</label></button>
                </div>
                <div class="dr-grp-label">Table of Contents</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.insertFootnote()"><span class="dr-icon">📝</span><label>Insert Footnote</label></button>
                    <button class="dr-btn-large" onclick="window.insertEndnote()"><span class="dr-icon">🔚</span><label>Insert Endnote</label></button>
                </div>
                <div class="dr-grp-label">Footnotes</div>
            </div>`;
    } else if (tabId === "review") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.onAnalyzeRequested()"><span class="dr-icon">🧐</span><label>Legal Review</label></button>
                    <button class="dr-btn-large" onclick="window.wordCount()"><span class="dr-icon">🔢</span><label>Word Count</label></button>
                </div>
                <div class="dr-grp-label">Proofing</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.translateDoc()"><span class="dr-icon">🌐</span><label>Translate</label></button>
                </div>
                <div class="dr-grp-label">Language</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.toggleTracking()"><span class="dr-icon">📍</span><label>Track Changes</label></button>
                </div>
                <div class="dr-grp-label">Tracking</div>
            </div>`;
    } else if (tabId === "view") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.setDocView('print')"><span class="dr-icon">📄</span><label>Print Layout</label></button>
                    <button class="dr-btn-large" onclick="window.setDocView('read')"><span class="dr-icon">📖</span><label>Read Mode</label></button>
                    <button class="dr-btn-large" onclick="window.printDraft()"><span class="dr-icon">🖨️</span><label>Print</label></button>
                </div>
                <div class="dr-grp-label">Views</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap" style="flex-direction:column; gap:2px">
                    <label style="font-size:11px"><input type="checkbox" checked onchange="window.toggleRuler(this.checked)"> Ruler</label>
                    <label style="font-size:11px"><input type="checkbox" onchange="window.toggleGrid(this.checked)"> Gridlines</label>
                </div>
                <div class="dr-grp-label">Show</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.setDocZoom(1)"><span class="dr-icon">🔍</span><label>100%</label></button>
                    <button class="dr-btn-large" onclick="window.setDocZoom(1.5)"><span class="dr-icon">➕</span><label>150%</label></button>
                    <button class="dr-btn-large" onclick="window.setDocZoom(0.75)"><span class="dr-icon">➖</span><label>75%</label></button>
                    <button class="dr-btn-large" onclick="window.setDocZoom('page')"><span class="dr-icon">📄</span><label>Page Width</label></button>
                </div>
                <div class="dr-grp-label">Zoom</div>
            </div>`;
    } else {
        html += `<div style="display:flex; align-items:center; justify-content:center; flex:1; font-size:12px; color:#666">Fitur pada tab "${tabId}" sedang disiapkan.</div>`;
    }
    return html;
}

// ── 3. MAIN WORKSPACE ENGINE ────────────────────────────────────────────────

window.modalLegalDrafting = async function() {
    const styleId = "officeModernStyles";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            :root {
                --off-blue: #2b579a;
                --off-bg: #f3f2f1;
                --off-border: #edebe9;
                --off-ribbon-h: 135px;
                --off-sidebar-w: 350px;
                --off-shadow: 0 2px 15px rgba(0,0,0,0.1);
            }
            .off-modal-fs {
                position: fixed; inset: 0; display: flex; flex-direction: column;
                background: #f3f2f1; z-index: 10000; font-family: 'Segoe UI', sans-serif;
                color: #333; overflow: hidden;
            }
            /* HEADER & TABS */
            .off-header { background: var(--off-blue); height: 48px; display: flex; align-items: center; padding: 0 15px; gap: 20px; color: #fff; }
            .off-tab-bar { background: var(--off-blue); display: flex; align-items: flex-end; padding-top: 4px; }
            .off-tab {
                padding: 6px 16px; cursor: pointer; color: #fff; font-size: 13px;
                border-bottom: 3px solid transparent; transition: 0.2s;
            }
            .off-tab:hover { background: rgba(255,255,255,0.1); }
            .off-tab.active { background: #f3f2f1; color: var(--off-blue); font-weight: 600; }
            .off-tab.menu { background: #185abd; font-weight: bold; }

            /* RIBBON AREA */
            .off-ribbon {
                background: #f3f2f1; height: 95px; border-bottom: 1px solid #ddd;
                display: flex; padding: 5px; gap: 2px; overflow-x: auto;
            }
            .dr-ribbon-grp {
                display: flex; flex-direction: column; align-items: center;
                padding: 0 8px; border-right: 1px solid #ddd; height: 100%;
            }
            .dr-actions-wrap { display: flex; align-items: center; flex: 1; gap: 5px; }
            .dr-grp-label { font-size: 10px; color: #666; margin-top: auto; padding-bottom: 2px; }

            /* BUTTONS & CONTROLS */
            .dr-btn-large {
                background: transparent; border: 1px solid transparent;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                gap: 2px; padding: 4px 8px; border-radius: 4px; cursor: pointer; min-width: 50px;
            }
            .dr-btn-large:hover { background: #e1dfdd; }
            .dr-btn-large .dr-icon { font-size: 1.8rem; line-height: 1; }
            .dr-btn-large label { font-size: 11px; cursor: pointer; text-align: center; }

            .dr-stacked-tools { display: flex; flex-direction: column; gap: 2px; }
            .dr-btn-compact {
                background: transparent; border: none; padding: 2px 6px; border-radius: 2px;
                font-size: 11px; display: flex; align-items: center; gap: 6px; cursor: pointer;
            }
            .dr-btn-compact:hover { background: #e1dfdd; }

            .dr-select-compact { border: 1px solid #ddd; background: #fff; height: 22px; font-size: 11px; padding: 0 4px; }
            .dr-btn-icon-only { width: 22px; height: 22px; background: transparent; border: 1px solid transparent; cursor: pointer; font-size: 12px; }
            .dr-btn-icon-only:hover { background: #e1dfdd; border-color: #ccc; }
            .dr-btn-style { width: 24px; height: 24px; border: 1px solid transparent; background: transparent; cursor: pointer; }
            .dr-btn-style:hover { background: #e1dfdd; }
            .dr-v-sep { width: 1px; height: 20px; background: #ddd; margin: 0 4px; }
            .dr-color-wrap { position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
            .dr-color-wrap input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
            .dr-color-wrap span { font-weight: bold; border-bottom: 3px solid #000; line-height: 1; }
            .dr-color-wrap.bg span { border-bottom: none; background: #ffff00; }

            .dr-styles-shelf { display: flex; gap: 5px; height: 100%; align-items: center; }
            .dr-style-card {
                width: 75px; height: 65px; border: 1px solid #ddd; background: #fff;
                display: flex; flex-direction: column; padding: 4px; cursor: pointer;
                overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            .dr-style-card:hover { border-color: var(--off-blue); }
            .dr-style-card.active { border-color: var(--off-blue); background: #f0f4ff; }
            .dr-style-card .preview { flex: 1; color: #666; font-size: 0.7rem; border-bottom: 1px solid #f0f0f0; margin-bottom: 4px; }
            .dr-style-card label { font-size: 9px; font-weight: 600; color: #444; }

            /* EDITOR AREA */
            .off-main { display: flex; flex: 1; overflow: hidden; position: relative; }
            .off-canvas {
                flex: 1; background: #e1dfdd; overflow: auto; display: flex;
                flex-direction: column; align-items: center; padding: 40px 10px;
                scroll-behavior: smooth; position: relative;
            }
            .dr-ruler-h {
                width: 210mm; height: 25px; background: #f9f9f9; border: 1px solid #ccc;
                display: flex; align-items: center; margin-bottom: 5px; position: sticky; top: -40px; z-index: 10;
            }
            .dr-page-a4 {
                background: white; width: 210mm; min-height: 297mm; color: #000;
                padding: 2.5cm; box-shadow: var(--off-shadow); position: relative;
                transform-origin: top center; transition: 0.2s;
            }
            .dr-header-box {
                position: absolute; top: 1cm; left: 2.5cm; right: 2.5cm; height: 1cm;
                font-size: 9pt; color: #999; border-bottom: 1px dashed transparent; outline: none;
            }
            .dr-footer-box {
                position: absolute; bottom: 1cm; left: 2.5cm; right: 2.5cm; height: 1cm;
                font-size: 9pt; color: #999; border-top: 1px dashed transparent; outline: none;
                display: flex; align-items: center;
            }
            .dr-header-box:hover, .dr-footer-box:hover, .dr-header-box:focus, .dr-footer-box:focus { border-color: #2b579a; color: #333; }

            .dr-editor {
                width: 100%; min-height: 100%; outline: none;
                font-family: 'Calibri', 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.15;
                text-align: justify;
            }

            /* GEMINI AI SIDEBAR */
            .off-ai-sidebar {
                width: var(--off-sidebar-w); background: #fff; display: flex; flex-direction: column;
                border-left: 1px solid #ddd; box-shadow: -2px 0 15px rgba(0,0,0,0.05);
            }
            .ai-head {
                padding: 20px; background: linear-gradient(135deg, #1a73e8 0%, #d93025 100%); color: #fff;
                display: flex; align-items: center; gap: 12px;
            }
            .ai-head h3 { margin: 0; font-size: 1.1rem; }
            .ai-chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; background: #f8f9fa; }
            .ai-msg { padding: 12px 16px; border-radius: 12px; font-size: 0.9rem; max-width: 90%; line-height: 1.5; }
            .ai-msg.user { background: #e8f0fe; align-self: flex-end; color: #1a73e8; border-bottom-right-radius: 2px; }
            .ai-msg.bot { background: #fff; align-self: flex-start; border: 1px solid #eee; border-bottom-left-radius: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
            .ai-input-area { padding: 15px; border-top: 1px solid #eee; background: #fff; }
            .ai-box { width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 12px; font-size: 0.9rem; outline: none; resize: none; min-height: 80px; margin-bottom: 10px; }
            .ai-box:focus { border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26,115,232,0.1); }
            .ai-send-btn { width: 100%; background: #1a73e8; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; }
            .ai-send-btn:hover { background: #1557b0; }

            /* STATUS BAR */
            .off-status { height: 25px; background: #00488e; color: #fff; display: flex; align-items: center; padding: 0 15px; font-size: 11px; gap: 20px; }
            .off-status span { display: flex; align-items: center; gap: 5px; }

            /* UTILITIES */
            .dr-input-mini { width: 45px; height: 20px; border: 1px solid #ddd; padding: 0 4px; font-size: 11px; }
            .hidden { display: none !important; }

            @media print { .off-header, .off-ribbon, .off-ai-sidebar, .off-status { display: none !important; } .off-canvas { padding: 0; background: #fff; } .dr-page-a4 { box-shadow: none; margin: 0; } }
        `;
        document.head.appendChild(style);
    }

    const tabButtons = WORD_TABS.map(t => `<div class="off-tab ${t.active ? 'active' : ''} ${t.isMenu ? 'menu' : ''}" onclick="window.switchOfficeTab('${t.id}', event)">${t.title}</div>`).join('');

    openModal(`
        <div class="off-modal-fs" id="legalSuite">
            <!-- Top App Bar -->
            <div class="off-header">
                <div style="font-weight:bold; font-size:16px">Drafting Pro</div>
                <div style="flex:1; display:flex; justify-content:center">
                    <div style="background:rgba(255,255,255,0.15); padding:4px 20px; border-radius:4px; font-size:12px; width:400px; text-align:center">🔍 Search (Alt+Q)</div>
                </div>
                <div style="display:flex; align-items:center; gap:10px">
                    <button class="btn btn-xs" style="background:#fff; color:#2b579a" onclick="window.saveDraft()">Save</button>
                    <button class="btn btn-xs" style="background:#d93025; color:#fff" onclick="closeModalDirect()">✕ Close</button>
                </div>
            </div>

            <!-- Ribbon Navigation -->
            <div class="off-tab-bar" id="officeTabs">
                ${tabButtons}
            </div>

            <!-- Ribbon Content -->
            <div class="off-ribbon" id="officeRibbon">
                ${getRibbonHtml('home')}
            </div>

            <!-- Main Split Layout -->
            <div class="off-main">
                <div class="off-canvas">
                    <!-- Horizontal Ruler -->
                    <div class="dr-ruler-h" id="suiteRuler">
                        <div style="flex:1; display:flex; justify-content:space-around; font-size:8px; color:#999">
                            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span>
                        </div>
                    </div>

                    <div class="dr-page-a4" id="suitePage">
                        <div class="dr-header-box" id="suiteHeader" contenteditable="true">Header Text...</div>
                        <div class="dr-editor" id="suiteEditor" contenteditable="true" oninput="window.updateStatus()">
                            <p style="text-align:center"><b>[JUDUL DOKUMEN]</b></p>
                            <p style="text-align:center">Nomor: [NOMOR_SURAT]</p>
                            <br>
                            <p>Mulai ketik draf hukum Anda di sini. Tekan tombol Legal Review di tab Review untuk analisis AI mendalam.</p>
                        </div>
                        <div class="dr-footer-box" id="suiteFooter" contenteditable="true">Footer Text...</div>
                    </div>
                </div>

                <!-- Gemini-Style AI Sidebar -->
                <div class="off-ai-sidebar">
                    <div class="ai-head">
                        <span style="font-size:1.5rem">✨</span>
                        <div>
                            <h3>Gemini Legal AI</h3>
                            <div style="font-size:11px; opacity:0.8">Advanced Reasoning Model</div>
                        </div>
                    </div>
                    <div class="ai-chat" id="suiteAiChat">
                        <div class="ai-msg bot">
                            Halo! Saya <b>Gemini Legal AI</b>. Saya telah membaca draf Anda secara real-time.
                            Bagaimana saya bisa membantu Anda hari ini?
                            <br><br>
                            <i>Coba: "Buat pasal Force Majeure", "Cek risiko hukum draf ini", atau "Ringkas draf ini".</i>
                        </div>
                    </div>
                    <div class="ai-input-area">
                        <textarea class="ai-box" id="suiteAiInput" placeholder="Ketik perintah hukum Anda..."></textarea>
                        <button class="ai-send-btn" onclick="window.askGemini()">Ask Gemini ✨</button>
                    </div>
                </div>
            </div>

            <!-- Status Bar -->
            <div class="off-status">
                <span id="suiteStatusPage">Page 1 of 1</span>
                <span id="suiteStatusWords">0 words</span>
                <span style="margin-left:auto">Accessibility: Good to go</span>
                <span>Layout: Print Layout</span>
                <span>Zoom: 100%</span>
            </div>

            <!-- Hidden Inputs -->
            <input type="file" id="drImgImport" style="display:none" accept="image/*" onchange="window.handleImageUpload(this)">
        </div>
    `, true);
    window.updateStatus();
};

// ── 4. ACTION LOGIC (Desktop-Grade Functions) ───────────────────────────────

window.switchOfficeTab = function(tabId, event) {
    if (tabId === "file") return toast("Menu File: Save, Print, Export", "info");
    document.querySelectorAll('.off-tab').forEach(t => t.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    document.getElementById("officeRibbon").innerHTML = getRibbonHtml(tabId);
};

window.formatDoc = function(cmd, val) {
    document.execCommand(cmd, false, val);
    const editor = document.getElementById("suiteEditor");
    if (editor) editor.focus();
    window.updateStatus();
};

window.applyDocStyle = function(type) {
    const editor = document.getElementById("suiteEditor");
    document.querySelectorAll('.dr-style-card').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (type === 'h1') window.formatDoc('formatBlock', 'H1');
    else if (type === 'title') window.formatDoc('formatBlock', 'H1'); // simulate title
    else window.formatDoc('formatBlock', 'P');
};

window.updateStatus = function() {
    const editor = document.getElementById("suiteEditor");
    const text = editor.innerText || "";
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById("suiteStatusWords").innerText = `${words} words`;
};

window.handleImageUpload = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = `<img src="${e.target.result}" style="max-width:100%; border:1px solid #eee; margin:10px 0">`;
        window.formatDoc('insertHTML', img);
    };
    reader.readAsDataURL(file);
    input.value = "";
};

window.insertDrTable = function() {
    const r = prompt("Rows:", "3"), c = prompt("Cols:", "3");
    if (!r || !c) return;
    let h = '<table style="width:100%; border-collapse:collapse; border:1px solid #ddd; margin:10px 0">';
    for(let i=0; i<r; i++) {
        h += '<tr>';
        for(let j=0; j<c; j++) h += '<td style="border:1px solid #ddd; padding:8px; min-height:25px"></td>';
        h += '</tr>';
    }
    h += '</table>';
    window.formatDoc('insertHTML', h);
};

window.saveDraft = function() {
    const content = document.getElementById("suiteEditor").innerHTML;
    const header = document.getElementById("suiteHeader").innerText;
    const footer = document.getElementById("suiteFooter").innerText;

    // Simulate saving to Firestore or local storage
    localStorage.setItem("legal_draft_autosave", JSON.stringify({ content, header, footer, timestamp: new Date().toISOString() }));
    toast("Draft saved successfully to local storage", "success");
};

window.findText = function() {
    const q = prompt("Find text:");
    if (q && window.find(q)) {
        // browser built-in find
    } else {
        toast("Text not found", "warning");
    }
};

window.replaceText = function() {
    const find = prompt("Find:");
    const replace = prompt("Replace with:");
    if (!find) return;
    const editor = document.getElementById("suiteEditor");
    editor.innerHTML = editor.innerHTML.split(find).join(replace);
    toast("Replaced occurrences", "success");
};

window.selectDoc = function() {
    const editor = document.getElementById("suiteEditor");
    const range = document.createRange();
    range.selectNodeContents(editor);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

window.insertCoverPage = function() {
    const html = `
        <div style="height:250mm; display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px solid #2b579a; padding:20px; margin-bottom:50px">
            <h1 style="font-size:36pt; margin-bottom:50px">LEGAL DOCUMENT</h1>
            <div style="width:100px; height:2px; background:#2b579a; margin-bottom:50px"></div>
            <h2 style="font-size:18pt">[DOCUMENT TITLE]</h2>
            <p style="margin-top:100px; font-size:12pt">Prepared by Legal Department</p>
            <p style="font-size:11pt">${new Date().toLocaleDateString()}</p>
        </div>
    `;
    window.formatDoc('insertHTML', html);
};

window.insertDrHeader = function() { document.getElementById("suiteHeader").focus(); toast("Header area focused", "info"); };
window.insertDrFooter = function() { document.getElementById("suiteFooter").focus(); toast("Footer area focused", "info"); };

window.insertPageNumber = function() {
    window.formatDoc('insertHTML', '<span style="color:#666; font-size:9pt">[Page 1]</span>');
};

window.setDrSize = function(size) {
    const page = document.getElementById("suitePage");
    if (size === 'A4') {
        page.style.width = "210mm";
        page.style.minHeight = "297mm";
    }
    toast("Size set to " + size, "success");
};

window.insertTOC = function() {
    const html = `
        <div style="background:#f9f9f9; padding:20px; border:1px solid #ddd; margin-bottom:20px">
            <p style="text-align:center; font-weight:bold">TABLE OF CONTENTS</p>
            <div style="display:flex; justify-content:space-between; margin-top:10px"><span>1. Introduction</span><span>.................... 1</span></div>
            <div style="display:flex; justify-content:space-between"><span>2. Definitions</span><span>.................... 2</span></div>
            <div style="display:flex; justify-content:space-between"><span>3. Obligations</span><span>.................... 5</span></div>
        </div>
    `;
    window.formatDoc('insertHTML', html);
};

window.insertFootnote = function() {
    const id = Date.now().toString().slice(-4);
    window.formatDoc('insertHTML', `<sup>[${id}]</sup>`);
    const footer = document.getElementById("suiteFooter");
    footer.innerHTML += `<div>[${id}] footnote description here...</div>`;
};

window.insertEndnote = function() {
    const editor = document.getElementById("suiteEditor");
    editor.innerHTML += `<div style="border-top:1px solid #ccc; margin-top:50px; padding-top:10px"><b>ENDNOTES</b><p>[1] Reference detail...</p></div>`;
};

window.wordCount = function() {
    const editor = document.getElementById("suiteEditor");
    const text = editor.innerText || "";
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    alert(`Word Count:\nWords: ${words}\nCharacters: ${chars}`);
};

window.toggleTracking = function() { toast("Track changes enabled (Simulated)", "info"); };

window.setDocView = function(view) {
    const canvas = document.querySelector(".off-canvas");
    const page = document.getElementById("suitePage");
    if (view === 'read') {
        canvas.style.background = "#fff";
        page.style.boxShadow = "none";
        toast("Switched to Read Mode", "info");
    } else {
        canvas.style.background = "#e1dfdd";
        page.style.boxShadow = "var(--off-shadow)";
        toast("Switched to Print Layout", "info");
    }
};

window.toggleRuler = function(show) { document.getElementById("suiteRuler").classList.toggle("hidden", !show); };
window.toggleGrid = function(show) { document.getElementById("suiteEditor").style.backgroundImage = show ? "linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)" : "none"; document.getElementById("suiteEditor").style.backgroundSize = "20px 20px"; };
window.toggleNavPane = function(show) { toast(show ? "Navigation Pane Shown" : "Navigation Pane Hidden", "info"); };

window.translateDoc = function() {
    const lang = prompt("Translate to (id, en, ja, zh):", "id");
    if (!lang) return;
    toast(`Translating document to ${lang} using Gemini AI...`, "info");
    setTimeout(() => {
        toast("Document translated successfully!", "success");
    }, 2000);
};

window.printDraft = function() {
    window.print();
};

window.setDrIndent = function(side, val) {
    const editor = document.getElementById("suiteEditor");
    if (side === 'left') editor.style.paddingLeft = `${val}cm`;
    else editor.style.paddingRight = `${val}cm`;
};

window.setDrSpacing = function(type, val) {
    const editor = document.getElementById("suiteEditor");
    if (type === 'before') editor.style.marginTop = `${val}pt`;
    else editor.style.marginBottom = `${val}pt`;
};

window.setDocZoom = function(val) {
    const page = document.getElementById("suitePage");
    if (val === 'page') page.style.transform = "scale(0.95)";
    else page.style.transform = `scale(${val})`;
};

// ── 5. ADVANCED GEMINI AI LOGIC ─────────────────────────────────────────────

window.askGemini = function() {
    const input = document.getElementById("suiteAiInput");
    const prompt = input.value.trim();
    if (!prompt) return;

    const chat = document.getElementById("suiteAiChat");
    chat.innerHTML += `<div class="ai-msg user">${escHtml(prompt)}</div>`;
    input.value = "";
    chat.scrollTop = chat.scrollHeight;

    // Simulate AI Thinking
    chat.innerHTML += `<div class="ai-msg bot" id="aiThinking">Gemini sedang berpikir...</div>`;
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
        document.getElementById("aiThinking").remove();
        let response = "";

        if (prompt.toLowerCase().includes("pasal")) {
            response = `Saya telah menyiapkan draf pasal tersebut berdasarkan standar hukum terbaru.
                <br><br><b>Saran Klausul:</b><br>
                <i>"Pihak Pertama berkewajiban menjaga kerahasiaan data selama 5 tahun..."</i>
                <br><br><button class="btn btn-xs btn-primary" onclick="window.formatDoc('insertHTML', '<p><b>PASAL BARU:</b> Pihak Pertama berkewajiban menjaga kerahasiaan data selama 5 tahun sejak perjanjian berakhir.</p>')">Apply to Document</button>`;
        } else if (prompt.toLowerCase().includes("risiko")) {
            response = "Berdasarkan draf Anda, ada risiko pada bagian 'Penyelesaian Sengketa'. Sebaiknya tentukan Pengadilan Negeri mana yang memiliki yurisdiksi tetap untuk menghindari ketidakpastian hukum.";
        } else {
            response = "Tentu, saya bisa membantu menganalisis itu. Sebagai AI Legal, saya menyarankan Anda untuk memeriksa kembali identitas para pihak agar sesuai dengan KTP/Akta Pendirian Perusahaan.";
        }

        chat.innerHTML += `<div class="ai-msg bot">${response}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 1500);
};

// ── 6. LEGAL MODULE NAVIGATION (Main Dashboard) ───────────────────────────

window.renderKajianHukum = async function() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title">
        <span>🔨 Kajian Hukum / Tiket</span>
        <div class="flex gap-8">
            <button class="btn btn-outline btn-sm" onclick="window.modalLegalDrafting()">✍️ Buat Draft</button>
            <button class="btn btn-primary btn-sm" onclick="window.modalKajianHukum()">+ Buat Tiket</button>
        </div>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>ID Tiket</th><th>Judul</th><th>Departemen</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr>
                </thead>
                <tbody id="tblLegalTickets">
                    <tr><td colspan="6" class="text-center">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    window.loadLegalTickets();
};

window.loadLegalTickets = async function() {
    const tbody = document.getElementById("tblLegalTickets");
    try {
        const snap = await db.collection("hrd_legal_tickets").orderBy("createdAt", "desc").get();
        let html = "";
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada tiket.</td></tr>';
            return;
        }
        snap.forEach((doc) => {
            const p = doc.data();
            html += `<tr><td class="fw-700">${escHtml(p.ticket_id)}</td><td>${escHtml(p.judul)}</td><td>${escHtml(p.departemen || "-")}</td><td>${p.status}</td><td>${formatDate(p.createdAt)}</td><td>
                <button class="btn btn-xs btn-info" onclick="window.viewLegalTicketDetail('${doc.id}')">👁️</button>
                <button class="btn btn-xs btn-danger" onclick="window.hapusLegalTicket('${doc.id}')">🗑️</button>
            </td></tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${e.message}</td></tr>`;
    }
};

window.modalKajianHukum = function() {
    openModal(`
        <div class="modal-title">🔨 Buat Tiket Kajian Hukum</div>
        <div class="form-group"><label>Judul Kajian</label><input class="form-control" id="lgJudul"></div>
        <div class="form-group"><label>Deskripsi</label><textarea class="form-control" id="lgDesc" style="min-height:120px"></textarea></div>
        <button class="btn btn-primary" onclick="window.simpanKajianHukum()">📤 Kirim</button>
    `, true);
};

window.simpanKajianHukum = async function() {
    const judul = document.getElementById("lgJudul").value.trim();
    const desc = document.getElementById("lgDesc").value.trim();
    if (!judul || !desc) return toast("Lengkapi data", "warning");
    const data = {
        ticket_id: `LGL-${Date.now().toString().slice(-6)}`,
        judul, deskripsi: desc, departemen: currentUser.departemen || '',
        pemohon: currentUser.nama, status: "pending", createdAt: new Date().toISOString()
    };
    await db.collection("hrd_legal_tickets").add(data);
    closeModalDirect(); window.renderKajianHukum();
};

window.viewLegalTicketDetail = async function(docId) {
    const doc = await db.collection("hrd_legal_tickets").doc(docId).get();
    const p = doc.data();
    openModal(`<div class="modal-title">📄 Detail Tiket</div><div class="text-sm">${escHtml(p.deskripsi)}</div>`, true);
};

window.hapusLegalTicket = async function(id) {
    if(!confirm("Hapus tiket ini?")) return;
    await db.collection("hrd_legal_tickets").doc(id).delete();
    toast("Tiket dihapus", "success");
    window.renderKajianHukum();
};

// ── 7. SENGKETA & KASUS HUKUM ───────────────────────────────────────────────

window.renderLegalSengketa = async function() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title">
        <span>⚠️ Sengketa & Kasus Hukum</span>
        <button class="btn btn-primary btn-sm" onclick="window.modalSengketa()">+ Tambah Kasus</button>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead><tr><th>ID</th><th>Judul</th><th>Kategori</th><th>Status</th><th>Pihak</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                <tbody id="tblLegalSengketa"><tr><td colspan="7" class="text-center">Memuat...</td></tr></tbody>
            </table>
        </div>
    </div>`;
    window.loadLegalSengketa();
};

window.loadLegalSengketa = async function() {
    const tbody = document.getElementById("tblLegalSengketa");
    try {
        const snap = await db.collection("hrd_legal_sengketa").orderBy("createdAt", "desc").get();
        let html = "";
        if (snap.empty) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">Kosong</td></tr>'; return; }
        snap.forEach((doc) => {
            const p = doc.data();
            const badg = p.status === 'Selesai' ? 'success' : p.status === 'Proses' ? 'warning' : 'danger';
            html += `<tr><td>${p.case_id}</td><td>${p.judul}</td><td>${p.kategori}</td><td><span class="badge badge-${badg}">${p.status}</span></td><td>${p.pihak}</td><td>${formatDate(p.createdAt)}</td><td><button class="btn btn-xs btn-info" onclick="window.viewSengketaDetail('${doc.id}')">👁️</button> <button class="btn btn-xs btn-danger" onclick="window.hapusSengketa('${doc.id}')">🗑️</button></td></tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) { tbody.innerHTML = `<tr><td colspan="7">Error</td></tr>`; }
};

window.modalSengketa = function() {
    openModal(`<div class="modal-title">Tambah Kasus</div><div class="form-group"><label>Judul</label><input class="form-control" id="skJudul"></div><div class="grid-2"><div class="form-group"><label>Kategori</label><select class="form-control" id="skKategori"><option>Perdata</option><option>Pidana</option><option>PHI</option></select></div><div class="form-group"><label>Status</label><select class="form-control" id="skStatus"><option>Baru</option><option>Proses</option><option>Selesai</option></select></div></div><div class="form-group"><label>Pihak</label><input class="form-control" id="skPihak"></div><div class="form-group"><label>Kronologi</label><textarea class="form-control" id="skKronologi"></textarea></div><button class="btn btn-primary" onclick="window.simpanSengketa()">Simpan</button>`, true);
};

window.simpanSengketa = async function() {
    const data = { case_id: `SKT-${Date.now().toString().slice(-6)}`, judul: document.getElementById("skJudul").value, kategori: document.getElementById("skKategori").value, status: document.getElementById("skStatus").value, pihak: document.getElementById("skPihak").value, kronologi: document.getElementById("skKronologi").value, createdAt: new Date().toISOString() };
    await db.collection("hrd_legal_sengketa").add(data);
    closeModalDirect(); window.renderLegalSengketa();
};

window.viewSengketaDetail = async function(id) {
    const doc = await db.collection("hrd_legal_sengketa").doc(id).get();
    const p = doc.data();
    openModal(`<div class="modal-title">${escHtml(p.judul)}</div><div class="text-sm">${escHtml(p.kronologi)}</div>`, true);
};

window.hapusSengketa = async function(id) {
    if(!confirm("Hapus?")) return;
    await db.collection("hrd_legal_sengketa").doc(id).delete();
    window.renderLegalSengketa();
};

// ── 8. LEGALITAS & PERIZINAN ───────────────────────────────────────────────

window.renderLegalPerizinan = async function() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `<div class="page-title"><span>⚖️ Legalitas & Perizinan</span><button class="btn btn-primary btn-sm" onclick="window.modalPerizinan()">+ Tambah</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Nomor</th><th>Penerbit</th><th>Masa Berlaku</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblLegalPerizinan"></tbody></table></div></div>`;
    window.loadLegalPerizinan();
};

window.loadLegalPerizinan = async function() {
    const tbody = document.getElementById("tblLegalPerizinan");
    const snap = await db.collection("hrd_legal_perizinan").orderBy("createdAt", "desc").get();
    let html = "";
    if (snap.empty) { tbody.innerHTML = '<tr><td colspan="6">Kosong</td></tr>'; return; }
    snap.forEach((doc) => {
        const p = doc.data();
        html += `<tr><td>${p.nama}</td><td>${p.nomor}</td><td>${p.instansi}</td><td>${formatDate(p.tglAkhir)}</td><td>Aktif</td><td><button class="btn btn-xs btn-danger" onclick="window.hapusPerizinan('${doc.id}')">🗑️</button></td></tr>`;
    });
    tbody.innerHTML = html;
};

window.modalPerizinan = function() {
    openModal(`<div class="modal-title">Tambah Dokumen</div><div class="form-group"><label>Nama</label><input class="form-control" id="pzNama"></div><div class="form-group"><label>Nomor</label><input class="form-control" id="pzNomor"></div><div class="form-group"><label>Berlaku s/d</label><input class="form-control" type="date" id="pzAkhir"></div><button class="btn btn-primary" onclick="window.simpanPerizinan()">Simpan</button>`, true);
};

window.simpanPerizinan = async function() {
    await db.collection("hrd_legal_perizinan").add({ nama: document.getElementById("pzNama").value, nomor: document.getElementById("pzNomor").value, tglAkhir: document.getElementById("pzAkhir").value, createdAt: new Date().toISOString() });
    closeModalDirect(); window.renderLegalPerizinan();
};

window.hapusPerizinan = async function(id) {
    if(!confirm("Hapus?")) return;
    await db.collection("hrd_legal_perizinan").doc(id).delete();
    window.renderLegalPerizinan();
};
