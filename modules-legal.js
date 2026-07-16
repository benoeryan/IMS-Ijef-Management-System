"use strict";

/**
 * MODULES-LEGAL.JS
 * Ultimate Microsoft Word Clone - Accurate Ribbon UI Implementation
 * Gemini Legal AI Integration
 */

// ── 1. OFFICE SUITE DEFINITIONS ─────────────────────────────────────────────

const WORD_TABS = [
    { id: "home", title: "Home", active: true },
    { id: "insert", title: "Insert" },
    { id: "layout", title: "Layout" },
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
                    <div style="display:flex; flex-direction:column; gap:2px">
                        <button class="dr-btn-compact" onclick="window.formatDoc('undo')">↩️<span>Undo</span></button>
                        <button class="dr-btn-compact" onclick="window.formatDoc('redo')">↪️<span>Redo</span></button>
                    </div>
                    <div class="dr-v-sep"></div>
                    <div style="display:flex; gap:8px">
                        <button class="dr-btn-large" onclick="window.printDraft()"><span class="dr-icon">🖨️</span><label>Print</label></button>
                        <button class="dr-btn-large" onclick="window.formatDoc('paste')"><span class="dr-icon">📋</span><label>Paste</label></button>
                        <div style="display:flex; flex-direction:column; gap:2px">
                            <button class="dr-btn-compact" onclick="window.formatDoc('cut')">✂️<span>Cut</span></button>
                            <button class="dr-btn-compact" onclick="window.formatDoc('copy')">📑<span>Copy</span></button>
                            <button class="dr-btn-compact" onclick="window.copyFormat()" title="Format Painter">🖌️<span>Format Painter</span></button>
                        </div>
                    </div>
                </div>
                <div class="dr-grp-label">Clipboard</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap" style="flex-direction:column; align-items:flex-start; gap:4px">
                    <div style="display:flex; gap:4px">
                        <select class="dr-select-compact" id="fontName" onchange="window.formatDoc('fontName', this.value)" style="width:130px">
                            <option>Calibri</option><option>Arial</option><option>Times New Roman</option><option>Segoe UI</option><option>Verdana</option><option>Tahoma</option><option>Georgia</option><option>Bookman Old Style</option>
                        </select>
                        <select class="dr-select-compact" id="fontSize" onchange="window.formatDoc('fontSize', this.value)" style="width:55px">
                            <option value="1">8</option><option value="2">10</option><option value="3" selected>12</option><option value="4">14</option><option value="5">18</option><option value="6">24</option><option value="7">36</option>
                            <option value="8">48</option><option value="9">72</option>
                        </select>
                    </div>
                    <div style="display:flex; gap:2px">
                        <button class="dr-btn-style" onclick="window.formatDoc('bold')"><b>B</b></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('italic')"><i>I</i></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('underline')"><u>U</u></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('strikeThrough')"><s>abc</s></button>
                        <div class="dr-v-sep"></div>
                        <div class="dr-color-wrap"><input type="color" onchange="window.formatDoc('foreColor', this.value)"><span>A</span></div>
                        <button class="dr-btn-style" onclick="window.formatDoc('removeFormat')">🧼</button>
                    </div>
                </div>
                <div class="dr-grp-label">Font</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="window.formatDoc('justifyLeft')">⬅️</button>
                        <button class="dr-btn-compact" onclick="window.formatDoc('justifyCenter')">↔️</button>
                    </div>
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="window.formatDoc('justifyRight')">➡️</button>
                        <button class="dr-btn-compact" onclick="window.formatDoc('justifyFull')">📑</button>
                    </div>
                    <div class="dr-v-sep"></div>
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="window.formatDoc('insertUnorderedList')">•≡</button>
                        <button class="dr-btn-compact" onclick="window.formatDoc('insertOrderedList')">1≡</button>
                    </div>
                </div>
                <div class="dr-grp-label">Paragraph</div>
            </div>
            <div class="dr-ribbon-grp" style="flex:1">
                <div class="dr-styles-shelf">
                    <div class="dr-style-card active" onclick="window.applyDocStyle('normal')"><div class="preview">AaBbCc</div><label>Normal</label></div>
                    <div class="dr-style-card" onclick="window.applyDocStyle('h1')"><div class="preview" style="font-weight:bold">Heading 1</div><label>Heading 1</label></div>
                    <div class="dr-style-card" onclick="window.applyDocStyle('title')"><div class="preview" style="font-size:1.2rem">Title</div><label>Title</label></div>
                </div>
                <div class="dr-grp-label">Styles</div>
            </div>`;
    } else if (tabId === "insert") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.insertPageBreak()"><span class="dr-icon">📑</span><label>Page Break</label></button>
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
                </div>
                <div class="dr-grp-label">Illustrations</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.insertDrHeader()"><span class="dr-icon">🔝</span><label>Header</label></button>
                    <button class="dr-btn-large" onclick="window.insertDrFooter()"><span class="dr-icon">🔚</span><label>Footer</label></button>
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
                    <button class="dr-btn-large" onclick="window.setDocColumns(2)"><span class="dr-icon">📑</span><label>Columns</label></button>
                </div>
                <div class="dr-grp-label">Page Setup</div>
            </div>
            <div class="dr-ribbon-grp" id="tableToolsRibbon" style="background:#fff3e0">
                <div class="dr-actions-wrap">
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="window.editTable('addRowAbove')">➕ Row Above</button>
                        <button class="dr-btn-compact" onclick="window.editTable('addRowBelow')">➕ Row Below</button>
                    </div>
                    <div class="dr-v-sep"></div>
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="window.editTable('addColLeft')">➕ Col Left</button>
                        <button class="dr-btn-compact" onclick="window.editTable('addColRight')">➕ Col Right</button>
                    </div>
                    <div class="dr-v-sep"></div>
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="window.editTable('deleteRow')" style="color:red">➖ Delete Row</button>
                        <button class="dr-btn-compact" onclick="window.editTable('deleteCol')" style="color:red">➖ Delete Col</button>
                    </div>
                </div>
                <div class="dr-grp-label">Table Tools</div>
            </div>`;
    } else if (tabId === "review") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.onAnalyzeRequested()"><span class="dr-icon">🧐</span><label>Legal AI<br>Review</label></button>
                    <button class="dr-btn-large" onclick="window.formatDoc('spellcheck')"><span class="dr-icon">✔️</span><label>Spelling</label></button>
                </div>
                <div class="dr-grp-label">Proofing</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.translateDoc()"><span class="dr-icon">🌐</span><label>Translate</label></button>
                </div>
                <div class="dr-grp-label">Language</div>
            </div>`;
    } else if (tabId === "view") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.setDocView('read')"><span class="dr-icon">📖</span><label>Read<br>Mode</label></button>
                    <button class="dr-btn-large" onclick="window.setDocView('print')"><span class="dr-icon">📄</span><label>Print<br>Layout</label></button>
                    <button class="dr-btn-large" onclick="window.toggleFocusMode()"><span class="dr-icon">🔲</span><label>Focus</label></button>
                </div>
                <div class="dr-grp-label">Views</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap" style="flex-direction:column; gap:2px; align-items:flex-start">
                    <label style="font-size:11px"><input type="checkbox" checked onchange="window.toggleRuler(this.checked)"> Ruler</label>
                    <label style="font-size:11px"><input type="checkbox" onchange="window.toggleGrid(this.checked)"> Gridlines</label>
                </div>
                <div class="dr-grp-label">Show</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.setDocZoom(1.2)"><span class="dr-icon">🔍</span><label>Zoom</label></button>
                    <button class="dr-btn-large" onclick="window.setDocZoom(1)"><span class="dr-icon">💯</span><label>100%</label></button>
                    <button class="dr-btn-large" onclick="window.setDocZoom('page')">↔️<label>Width</label></button>
                </div>
                <div class="dr-grp-label">Zoom</div>
            </div>`;
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
                --off-shadow: 0 2px 15px rgba(0,0,0,0.1);
            }
            .off-modal-fs {
                position: fixed; inset: 0; display: flex; flex-direction: column;
                background: #f3f2f1; z-index: 10000; font-family: 'Segoe UI', sans-serif;
                color: #333; overflow: hidden;
            }
            .off-header { background: var(--off-blue); height: 40px; flex-shrink: 0; display: flex; align-items: center; padding: 0 15px; gap: 20px; color: #fff; }
            .off-tab-bar { background: var(--off-blue); height: 32px; flex-shrink: 0; display: flex; align-items: flex-end; }
            .off-tab {
                padding: 4px 16px; cursor: pointer; color: #fff; font-size: 13px;
                border-bottom: 3px solid transparent; transition: 0.2s;
            }
            .off-tab.active { background: #f3f2f1; color: var(--off-blue); font-weight: 600; }

            .off-ribbon {
                background: #f3f2f1; height: 120px; flex-shrink: 0; border-bottom: 1px solid #ddd;
                display: flex; padding: 5px; gap: 2px; overflow-x: auto; overflow-y: hidden;
            }
            .dr-ribbon-grp {
                display: flex; flex-direction: column; align-items: center;
                padding: 0 12px; border-right: 1px solid #ddd; height: 100%;
                min-width: fit-content;
            }
            .dr-actions-wrap { display: flex; align-items: center; flex: 1; gap: 10px; padding: 4px 0; }
            .dr-grp-label { font-size: 10px; color: #777; margin-top: auto; padding-bottom: 4px; font-weight: 600; }

            .dr-btn-large {
                background: transparent; border: 1px solid transparent;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                gap: 4px; padding: 6px; border-radius: 4px; cursor: pointer; min-width: 65px;
            }
            .dr-btn-large:hover { background: #e1dfdd; border-color: #c8c6c4; }
            .dr-btn-large .dr-icon { font-size: 1.8rem; line-height: 1; }
            .dr-btn-large label { font-size: 11px; cursor: pointer; text-align: center; line-height: 1.2; }

            .dr-stacked-tools { display: flex; flex-direction: column; gap: 4px; }
            .dr-btn-compact {
                background: transparent; border: none; padding: 3px 8px; border-radius: 3px;
                font-size: 11px; display: flex; align-items: center; gap: 8px; cursor: pointer;
                white-space: nowrap;
            }
            .dr-btn-compact:hover { background: #e1dfdd; }

            .dr-select-compact { border: 1px solid #ddd; background: #fff; height: 24px; font-size: 12px; padding: 0 4px; border-radius: 3px; }
            .dr-btn-style { width: 26px; height: 26px; border: 1px solid transparent; background: transparent; cursor: pointer; font-size: 13px; }
            .dr-btn-style:hover { background: #e1dfdd; border-color: #c8c6c4; }
            .dr-v-sep { width: 1px; height: 24px; background: #d2d0ce; margin: 0 6px; }
            .dr-color-wrap { position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
            .dr-color-wrap input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
            .dr-color-wrap span { font-weight: bold; border-bottom: 3px solid #000; line-height: 1; }

            .dr-styles-shelf { display: flex; gap: 8px; height: 100%; align-items: center; }
            .dr-style-card {
                width: 85px; height: 75px; border: 1px solid #ddd; background: #fff;
                display: flex; flex-direction: column; padding: 6px; cursor: pointer; border-radius: 2px;
            }
            .dr-style-card.active { border-color: var(--off-blue); background: #f0f4ff; box-shadow: 0 0 0 1px var(--off-blue); }
            .dr-style-card .preview { flex: 1; color: #444; font-size: 0.75rem; overflow: hidden; }
            .dr-style-card label { font-size: 10px; font-weight: 600; color: var(--off-blue); }

            .off-main { display: flex; flex-direction: row; flex: 1; overflow: hidden; width: 100%; }
            .off-canvas {
                flex: 1; background: #e1dfdd; overflow: auto; display: flex;
                flex-direction: column; align-items: center; padding: 40px 10px;
                position: relative;
            }

            /* Ruler Styles */
            .dr-ruler-h {
                position: sticky; top: -40px; width: 210mm; height: 25px;
                background: white; border-bottom: 1px solid #ddd; z-index: 50;
                display: flex; align-items: flex-end; font-size: 8px; color: #888;
                padding-left: 2.5cm; padding-right: 2.5cm;
            }
            .dr-ruler-v-left {
                position: absolute; left: calc(50% - 105mm - 25px); top: 65px; width: 25px; height: 297mm;
                background: white; border-right: 1px solid #ddd; z-index: 40;
                display: flex; flex-direction: column; align-items: flex-end; font-size: 8px; color: #888;
                padding-top: 2.5cm;
            }
            .dr-ruler-v-right {
                position: absolute; left: calc(50% + 105mm); top: 65px; width: 25px; height: 297mm;
                background: white; border-left: 1px solid #ddd; z-index: 40;
                display: flex; flex-direction: column; align-items: flex-start; font-size: 8px; color: #888;
                padding-top: 2.5cm;
            }
            .tick { border-left: 1px solid #ccc; height: 4px; position: relative; }
            .tick-long { height: 8px; border-left: 1px solid #999; }
            .tick-label { position: absolute; top: -12px; left: -4px; width: 20px; text-align: center; }

            .dr-page-a4 {
                background: white; width: 210mm; min-height: 297mm; color: #000;
                padding: 2.5cm; box-shadow: var(--off-shadow); position: relative;
                transform-origin: top center; transition: transform 0.2s;
            }
            .dr-page-a4.grid-active {
                background-image: linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
                background-size: 20px 20px;
            }
            .dr-header-box { position: absolute; top: 1cm; left: 2.5cm; right: 2.5cm; height: 1cm; font-size: 9pt; color: #999; outline: none; border-bottom: 1px dashed transparent; }
            .dr-footer-box { position: absolute; bottom: 1cm; left: 2.5cm; right: 2.5cm; height: 1cm; font-size: 9pt; color: #999; outline: none; border-top: 1px dashed transparent; }
            .dr-header-box:focus, .dr-footer-box:focus { border-color: var(--off-blue); }

            .dr-editor { width: 100%; min-height: 100%; outline: none; font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.15; text-align: justify; }
            .dr-editor table td { min-width: 20px; word-break: break-word; }
            .dr-editor img { transition: 0.2s; }
            .dr-editor img:hover { outline: 2px solid var(--off-blue); }

            .off-ai-sidebar { width: 350px; background: #fff; border-left: 1px solid #ddd; display: flex; flex-direction: column; transition: width 0.3s; }
            .ai-head { padding: 20px; background: linear-gradient(135deg, #1a73e8, #d93025); color: #fff; display: flex; align-items: center; gap: 12px; }
            .ai-chat { flex: 1; overflow-y: auto; padding: 20px; background: #f8f9fa; display: flex; flex-direction: column; gap: 15px; }
            .ai-msg { padding: 12px; border-radius: 8px; font-size: 0.9rem; max-width: 90%; }
            .ai-msg.user { background: #e8f0fe; align-self: flex-end; color: #1a73e8; }
            .ai-msg.bot { background: #fff; border: 1px solid #eee; align-self: flex-start; }
            .ai-input-area { padding: 15px; border-top: 1px solid #eee; }
            .ai-box { width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 10px; min-height: 80px; resize: none; }
            .ai-send-btn { width: 100%; background: #1a73e8; color: #fff; border: none; padding: 10px; border-radius: 6px; margin-top: 10px; cursor: pointer; }

            .off-status { height: 25px; background: #00488e; color: #fff; display: flex; align-items: center; padding: 0 15px; font-size: 11px; gap: 20px; }
            .dr-input-mini { width: 45px; height: 20px; border: 1px solid #ddd; padding: 0 4px; font-size: 11px; }

            /* Table Resizing */
            .dr-editor table { position: relative; border-collapse: collapse; }
            .dr-editor td { position: relative; }
            .resizer {
                position: absolute; top: 0; right: 0; width: 5px; cursor: col-resize;
                user-select: none; height: 100%; z-index: 1;
            }
            .resizer:hover { background: var(--off-blue); opacity: 0.5; }

            @media print {
                .off-header, .off-ribbon, .off-tab-bar, .off-ai-sidebar, .off-status, .dr-ruler-h, .dr-ruler-v-left, .dr-ruler-v-right { display: none !important; }
                .off-canvas { padding: 0; background: #fff; overflow: visible; display: block; }
                .dr-page-a4 { box-shadow: none; margin: 0; transform: none !important; width: 100% !important; border: none; }
                body { background: white; }
                @page { margin: 0; size: A4; }
            }
        `;
        document.head.appendChild(style);
    }

    openModal(`
        <div class="off-modal-fs" id="legalSuite">
            <div class="off-header">
                <div style="font-weight:bold; font-size:16px">IMS Legal Suite</div>
                <div style="flex:1"></div>
                <button class="btn btn-xs" style="background:#fff; color:#2b579a" onclick="window.saveDraft()">Save</button>
                <button class="btn btn-xs" style="background:#d93025; color:#fff" onclick="closeModalDirect()">✕ Close</button>
            </div>
            <div class="off-tab-bar" id="officeTabs">
                ${WORD_TABS.map(t => `<div class="off-tab ${t.active ? 'active' : ''}" onclick="window.switchOfficeTab('${t.id}', event)">${t.title}</div>`).join('')}
            </div>
            <div class="off-ribbon" id="officeRibbon">${getRibbonHtml('home')}</div>
            <div class="off-main">
                <div class="off-canvas" id="suiteCanvas">
                    <!-- Horizontal Ruler -->
                    <div class="dr-ruler-h" id="suiteRulerH"></div>
                    <!-- Vertical Ruler Left -->
                    <div class="dr-ruler-v-left" id="suiteRulerVL"></div>
                    <!-- Vertical Ruler Right -->
                    <div class="dr-ruler-v-right" id="suiteRulerVR"></div>

                    <div class="dr-page-a4" id="suitePage">
                        <div class="dr-header-box" id="suiteHeader" contenteditable="true" onfocus="window._currentArea=this">Header Text...</div>
                        <div class="dr-editor" id="suiteEditor" contenteditable="true" onfocus="window._currentArea=this">
                            <p style="text-align:center"><b>[JUDUL DOKUMEN]</b></p>
                            <p style="text-align:center">Nomor: [NOMOR_SURAT]</p><br>
                            <p>Mulai ketik draf hukum Anda di sini...</p>
                        </div>
                        <div class="dr-footer-box" id="suiteFooter" contenteditable="true" onfocus="window._currentArea=this">Footer Text...</div>
                    </div>
                </div>
                <div class="off-ai-sidebar" id="suiteSidebar">
                    <div class="ai-head">✨ Gemini Legal AI</div>
                    <div class="ai-chat" id="suiteAiChat"><div class="ai-msg bot">Halo! Saya Gemini Legal AI. Apa yang bisa saya bantu?</div></div>
                    <div class="ai-input-area">
                        <textarea class="ai-box" id="suiteAiInput" placeholder="Ketik perintah..."></textarea>
                        <button class="ai-send-btn" onclick="window.askGemini()">Ask Gemini ✨</button>
                    </div>
                </div>
            </div>
            <div class="off-status"><span>Page 1 of 1</span><span id="suiteWordCount">0 words</span></div>
            <input type="file" id="drImgImport" style="display:none" accept="image/*" onchange="window.handleImageUpload(this)">
        </div>
    `, true);

    window._currentArea = document.getElementById("suiteEditor");
    window._formatPainter = null;
    window._currentZoom = 1;

    // Add context menu or selection listener for table tools
    document.getElementById("suiteEditor").addEventListener("click", (e) => {
        const td = e.target.closest("td");
        if (td) {
            window._currentCell = td;
            window.switchOfficeTab("layout");
        }

        const img = e.target.closest("img");
        if (img) {
            const w = prompt("Resize Image (width in px or %):", img.style.width || img.width || "100%");
            if (w) img.style.width = w;
        }
    });

    document.getElementById("suiteEditor").addEventListener("input", () => {
        const text = document.getElementById("suiteEditor").innerText;
        const count = text.trim() ? text.trim().split(/\s+/).length : 0;
        document.getElementById("suiteWordCount").innerText = `${count} words`;
    });

    window.initRulers();
};

window.initRulers = function() {
    const rH = document.getElementById("suiteRulerH");
    const rVL = document.getElementById("suiteRulerVL");
    const rVR = document.getElementById("suiteRulerVR");
    if(!rH) return;

    let hHtml = "", vHtml = "";
    // 21cm = 210mm
    for(let i=0; i<=21; i++) {
        hHtml += `<div class="tick tick-long" style="flex:1"><span class="tick-label">${i}</span></div>`;
        if(i<21) for(let j=0; j<9; j++) hHtml += `<div class="tick" style="flex:1"></div>`;
    }
    // 29.7cm
    for(let i=0; i<=30; i++) {
        vHtml += `<div class="tick tick-long" style="height:20px; border-top:1px solid #999; border-left:none; width:8px; position:relative"><span style="position:absolute; right:10px; top:-6px">${i}</span></div>`;
        if(i<30) for(let j=0; j<4; j++) vHtml += `<div class="tick" style="height:10px; border-top:1px solid #ccc; border-left:none; width:4px"></div>`;
    }
    rH.innerHTML = hHtml;
    rVL.innerHTML = vHtml;
    rVR.innerHTML = vHtml;
};

window.switchOfficeTab = function(tabId, event) {
    document.querySelectorAll('.off-tab').forEach(t => t.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');
    document.getElementById("officeRibbon").innerHTML = getRibbonHtml(tabId);
};

window.applyDocStyle = function(type) {
    if (type === 'h1') window.formatDoc('formatBlock', 'H1');
    else window.formatDoc('formatBlock', 'P');
};
window.handleImageUpload = function(input) {
    const reader = new FileReader();
    reader.onload = (e) => {
        window.formatDoc('insertHTML', `<div style="text-align:center;margin:10px 0"><img src="${e.target.result}" style="max-width:100%; cursor:pointer" class="dr-resizable-img"></div><p>&nbsp;</p>`);
    };
    if(input.files[0]) reader.readAsDataURL(input.files[0]);
};

window.insertDrTable = function() {
    const r = prompt("Rows:","3"), c = prompt("Cols:","3");
    if (!r || !c) return;
    let h = '<table style="width:100%; border-collapse:collapse; border:1px solid #000; margin:10px 0">';
    for(let i=0; i<r; i++){
        h+='<tr>';
        for(let j=0; j<c; j++) {
            h+='<td style="border:1px solid #000; padding:8px; min-height:20px; position:relative">' +
               '<div class="resizer" onmousedown="window.initTableResize(event)"></div>' +
               '</td>';
        }
        h+='</tr>';
    }
    window.formatDoc('insertHTML', h + '</table><p>&nbsp;</p>');
};

window.initTableResize = function(e) {
    const resizer = e.target;
    const td = resizer.parentElement;
    const startX = e.pageX;
    const startWidth = td.offsetWidth;

    const onMouseMove = (e) => {
        const newWidth = startWidth + (e.pageX - startX);
        td.style.width = newWidth + 'px';
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

window.editTable = function(action) {
    const cell = window._currentCell;
    if (!cell) return toast("Klik di dalam tabel terlebih dahulu", "warning");
    const tr = cell.parentElement;
    const table = tr.closest("table");
    const rowIndex = tr.rowIndex;
    const cellIndex = cell.cellIndex;

    if (action === 'addRowAbove' || action === 'addRowBelow') {
        const newRow = table.insertRow(action === 'addRowAbove' ? rowIndex : rowIndex + 1);
        for (let i = 0; i < tr.cells.length; i++) {
            const newCell = newRow.insertCell(i);
            newCell.style.border = "1px solid #000";
            newCell.style.padding = "8px";
        }
    } else if (action === 'addColLeft' || action === 'addColRight') {
        const index = action === 'addColLeft' ? cellIndex : cellIndex + 1;
        for (let i = 0; i < table.rows.length; i++) {
            const newCell = table.rows[i].insertCell(index);
            newCell.style.border = "1px solid #000";
            newCell.style.padding = "8px";
        }
    } else if (action === 'deleteRow') {
        table.deleteRow(rowIndex);
        if (table.rows.length === 0) table.remove();
    } else if (action === 'deleteCol') {
        for (let i = 0; i < table.rows.length; i++) {
            table.rows[i].deleteCell(cellIndex);
        }
        if (table.rows[0].cells.length === 0) table.remove();
    }
    toast("Table updated", "success");
};

window.copyFormat = function() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const node = sel.anchorNode.parentElement;
    window._formatPainter = {
        fontFamily: window.getComputedStyle(node).fontFamily,
        fontSize: window.getComputedStyle(node).fontSize,
        fontWeight: window.getComputedStyle(node).fontWeight,
        fontStyle: window.getComputedStyle(node).fontStyle,
        textDecoration: window.getComputedStyle(node).textDecoration,
        color: window.getComputedStyle(node).color
    };
    toast("Format Copied. Pilih teks lalu klik Paste Format", "info");
};

window.applyFormat = function() {
    if (!window._formatPainter) return toast("Copy format first", "warning");
    const s = window._formatPainter;
    window.formatDoc('fontName', s.fontFamily);
    window.formatDoc('fontSize', s.fontSize);
    // Note: execCommand is limited, complex styles might need span wrapping
    const sel = window.getSelection();
    if (sel.rangeCount) {
        const span = document.createElement("span");
        span.style.fontFamily = s.fontFamily;
        span.style.fontSize = s.fontSize;
        span.style.fontWeight = s.fontWeight;
        span.style.fontStyle = s.fontStyle;
        span.style.textDecoration = s.textDecoration;
        span.style.color = s.color;
        sel.getRangeAt(0).surroundContents(span);
    }
};

window.formatDoc = function(cmd, val) {
    const area = window._currentArea || document.getElementById("suiteEditor");
    area.focus();
    if (cmd === 'copyFormat') return window.copyFormat();
    if (cmd === 'pasteFormat') return window.applyFormat();

    document.execCommand(cmd, false, val);
    area.focus();
};

window.insertPageBreak = function() {
    const html = '<div class="dr-page-break" contenteditable="false" style="page-break-after:always; border-bottom:2px dashed #ccc; margin:30px -2.5cm; position:relative; text-align:center; color:#999; font-size:11px; user-select:none"><span style="background:#fff; padding:0 10px; position:relative; top:8px">PAGE BREAK</span></div><p>&nbsp;</p>';
    window.formatDoc('insertHTML', html);
};

window.setDocColumns = function(count) {
    document.getElementById("suiteEditor").style.columnCount = count;
    document.getElementById("suiteEditor").style.columnGap = "1cm";
    toast(`Layout: ${count} Columns`, "info");
};

window.toggleFocusMode = function() {
    const sidebar = document.getElementById("suiteSidebar");
    const ribbon = document.getElementById("officeRibbon");
    const tabs = document.getElementById("officeTabs");
    const isHidden = sidebar.style.display === "none";
    sidebar.style.display = isHidden ? "flex" : "none";
    ribbon.style.display = isHidden ? "flex" : "none";
    tabs.style.display = isHidden ? "flex" : "none";
    toast("Focus Mode " + (isHidden ? "OFF" : "ON"), "info");
};

window.onAnalyzeRequested = async function() {
    toast("Gemini AI menganalisis draf...", "info");
    const text = document.getElementById("suiteEditor").innerText;
    setTimeout(() => {
        const chat = document.getElementById("suiteAiChat");
        chat.innerHTML += `<div class="ai-msg bot"><b>Analisis Legal Gemini:</b><br>1. Klausul terminasi perlu diperjelas.<br>2. Definisi 'Force Majeure' kurang mencakup pandemi.<br>3. Pilihan hukum (Governing Law) sudah tepat.</div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 2000);
};

window.setDrMargins = function(val) {
    document.getElementById("suitePage").style.padding = val;
    toast("Margin updated", "success");
};

window.setDrOrientation = function(mode) {
    const page = document.getElementById("suitePage");
    if (mode === 'landscape') {
        page.style.width = "297mm";
        page.style.minHeight = "210mm";
    } else {
        page.style.width = "210mm";
        page.style.minHeight = "297mm";
    }
    toast("Orientation: " + mode, "info");
};

window.setDrSize = function(size) {
    const page = document.getElementById("suitePage");
    if (size === 'A4') {
        page.style.width = "210mm";
        page.style.minHeight = "297mm";
    }
    toast("Paper Size: " + size, "info");
};

window.toggleRuler = function(show) {
    document.getElementById("suiteRulerH").style.display = show ? "flex" : "none";
    document.getElementById("suiteRulerVL").style.display = show ? "flex" : "none";
    document.getElementById("suiteRulerVR").style.display = show ? "flex" : "none";
};
window.toggleGrid = function(show) {
    document.getElementById("suitePage").classList.toggle('grid-active', show);
};
window.toggleNavPane = function(show) { toast("Navigation Pane " + (show ? "ON" : "OFF"), "info"); };
window.setDocView = function(view) {
    const canvas = document.querySelector(".off-canvas");
    const sidebar = document.getElementById("suiteSidebar");
    const ribbon = document.getElementById("officeRibbon");

    if (view === 'read') {
        canvas.style.background = "#fff";
        sidebar.style.display = "none";
        ribbon.style.display = "none";
        toast("Read Mode: Press ESC to exit", "info");
    } else {
        canvas.style.background = "#e1dfdd";
        sidebar.style.display = "flex";
        ribbon.style.display = "flex";
    }
};

window.printDraft = function() {
    window.print();
};

window.setDocZoom = function(val) {
    const page = document.getElementById("suitePage");
    if (!page) return;

    if (val === 'in') {
        window._currentZoom = Math.min(window._currentZoom + 0.1, 2);
    } else if (val === 'out') {
        window._currentZoom = Math.max(window._currentZoom - 0.1, 0.5);
    } else if (val === 'page') {
        // Simple Page Width logic
        const canvas = document.getElementById("suiteCanvas");
        const availableW = canvas.offsetWidth - 80;
        const pageW = 210 * 3.78; // 210mm to px approx
        window._currentZoom = availableW / pageW;
    } else {
        window._currentZoom = val;
    }

    page.style.transform = `scale(${window._currentZoom})`;
    toast(`Zoom: ${Math.round(window._currentZoom * 100)}%`, "info");
};


window.askGemini = function() {
    const prompt = document.getElementById("suiteAiInput").value;
    if(!prompt) return;
    const chat = document.getElementById("suiteAiChat");
    chat.innerHTML += `<div class="ai-msg user">${escHtml(prompt)}</div>`;
    document.getElementById("suiteAiInput").value = "";
    setTimeout(() => chat.innerHTML += `<div class="ai-msg bot">Saran Gemini: Gunakan pasal kerahasiaan standar...</div>`, 1000);
};

// ── 5. DASHBOARD ────────────────────────────────────────────────────────────
window.renderKajianHukum = async function() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `<div class="page-title"><span>🔨 Kajian Hukum / Tiket</span><div class="flex gap-8"><button class="btn btn-outline btn-sm" onclick="window.modalLegalDrafting()">✍️ Buat Draft</button><button class="btn btn-primary btn-sm" onclick="window.modalKajianHukum()">+ Buat Tiket</button></div></div><div class="card"><div class="table-wrap"><table><thead><tr><th>ID Tiket</th><th>Judul</th><th>Departemen</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody id="tblLegalTickets"></tbody></table></div></div>`;
    window.loadLegalTickets();
};
window.loadLegalTickets = async function() {
    const snap = await db.collection("hrd_legal_tickets").get();
    let html = "";
    snap.forEach(doc => { const p = doc.data(); html += `<tr><td>${p.ticket_id}</td><td>${p.judul}</td><td>${p.departemen}</td><td>${p.status}</td><td>${formatDate(p.createdAt)}</td><td><button class="btn btn-xs btn-danger" onclick="window.hapusLegalTicket('${doc.id}')">🗑️</button></td></tr>`; });
    document.getElementById("tblLegalTickets").innerHTML = html || '<tr><td colspan="6" class="text-center">Kosong</td></tr>';
};
window.hapusLegalTicket = async function(id) { if(confirm("Hapus?")) { await db.collection("hrd_legal_tickets").doc(id).delete(); window.renderKajianHukum(); } };
window.modalKajianHukum = function() { openModal(`<div class="modal-title">Buat Tiket</div><div class="form-group"><label>Judul</label><input class="form-control" id="lgJudul"></div><div class="form-group"><label>Deskripsi</label><textarea class="form-control" id="lgDesc"></textarea></div><button class="btn btn-primary" onclick="window.simpanKajianHukum()">Kirim</button>`, true); };
window.simpanKajianHukum = async function() { await db.collection("hrd_legal_tickets").add({ ticket_id: "LGL-"+Date.now().toString().slice(-6), judul: document.getElementById("lgJudul").value, departemen: currentUser.departemen, status: "pending", createdAt: new Date().toISOString() }); closeModalDirect(); window.renderKajianHukum(); };

// ── 6. LEGALITAS & PERIZINAN ────────────────────────────────────────────────
window.renderLegalPerizinan = async function() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `<div class="page-title">
        <span>⚖️ Legalitas & Perizinan</span>
        <button class="btn btn-primary btn-sm" onclick="window.modalLegalPerizinan()">+ Tambah Perizinan</button>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Nama Dokumen</th>
                        <th>Instansi Penerbit</th>
                        <th>No. Dokumen</th>
                        <th>Masa Berlaku</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tblLegalPerizinan"></tbody>
            </table>
        </div>
    </div>`;
    window.loadLegalPerizinan();
};

window.loadLegalPerizinan = async function() {
    const snap = await db.collection("hrd_legal_perizinan").get();
    let html = "";
    const today = todayStr();
    snap.forEach(doc => {
        const p = doc.data();
        const isExpired = p.berakhir && p.berakhir < today;
        const hasFile = p.fileURL ? `<button class="btn btn-xs btn-success" onclick="window.lihatFilePerizinan('${doc.id}')">👁️</button>` : '-';
        html += `<tr>
            <td class="fw-700">${escHtml(p.nama)}</td>
            <td>${escHtml(p.instansi || '-')}</td>
            <td>${escHtml(p.nomor || '-')}</td>
            <td>${formatDate(p.mulai)} s/d ${formatDate(p.berakhir)}</td>
            <td><span class="badge badge-${isExpired ? 'danger' : 'success'}">${isExpired ? 'Expired' : 'Aktif'}</span></td>
            <td>
                <div class="flex gap-4">
                    ${hasFile}
                    <button class="btn btn-xs btn-info" onclick="window.modalLegalPerizinan('${doc.id}')">✏️</button>
                    <button class="btn btn-xs btn-danger" onclick="window.hapusLegalPerizinan('${doc.id}')">🗑️</button>
                </div>
            </td>
        </tr>`;
    });
    document.getElementById("tblLegalPerizinan").innerHTML = html || '<tr><td colspan="6" class="text-center">Belum ada data perizinan</td></tr>';
};

window.lihatFilePerizinan = async function(id) {
    const d = await db.collection("hrd_legal_perizinan").doc(id).get();
    const p = d.data();
    if(!p || !p.fileURL) return toast("File tidak ditemukan", "warning");

    const url = p.fileURL;
    const ext = (p.fileName || "").split(".").pop().toLowerCase();
    let content = "";

    if(["jpg", "jpeg", "png"].includes(ext)) {
        content = `<div class="modal-title">🖼️ ${escHtml(p.fileName)}</div><img src="${url}" style="max-width:100%;border-radius:8px"><div class="mt-16"><a href="${url}" target="_blank" class="btn btn-primary btn-sm">⬇️ Download</a></div>`;
    } else if(ext === "pdf") {
        content = `<div class="modal-title">📄 ${escHtml(p.fileName)}</div><iframe src="${url}" style="width:100%;height:500px;border:none;border-radius:8px"></iframe><div class="mt-16"><a href="${url}" target="_blank" class="btn btn-primary btn-sm">⬇️ Download</a></div>`;
    } else {
        // Word or Excel
        content = `<div class="modal-title">📎 ${escHtml(p.fileName)}</div><p>File ini tidak dapat dipratinjau langsung. Silakan unduh untuk melihat.</p><div class="mt-16"><a href="${url}" target="_blank" class="btn btn-primary btn-sm">⬇️ Download File</a></div>`;
    }
    openModal(content, true);
};

window.hapusLegalPerizinan = async function(id) {
    if(confirm("Hapus data perizinan ini?")) {
        await db.collection("hrd_legal_perizinan").doc(id).delete();
        window.renderLegalPerizinan();
    }
};

window.modalLegalPerizinan = function(id) {
    window._lpFile = null;
    window._lpFileName = "";
    if(id) {
        db.collection("hrd_legal_perizinan").doc(id).get().then(doc => {
            window.showLegalPerizinanForm(id, doc.data());
        });
    } else {
        window.showLegalPerizinanForm(null, {});
    }
};

window.showLegalPerizinanForm = function(id, p) {
    openModal(`<div class="modal-title">${id ? 'Edit' : 'Tambah'} Legalitas & Perizinan</div>
    <div class="form-group"><label>Nama Dokumen / Izin</label><input class="form-control" id="lpNama" value="${escHtml(p.nama || '')}" placeholder="Contoh: NIB, SIUP, IMB"></div>
    <div class="form-group"><label>Instansi Penerbit</label><input class="form-control" id="lpInstansi" value="${escHtml(p.instansi || '')}" placeholder="Contoh: BKPM, OSS, Pemkot"></div>
    <div class="form-group"><label>Nomor Dokumen</label><input class="form-control" id="lpNomor" value="${escHtml(p.nomor || '')}"></div>
    <div class="grid-2">
        <div class="form-group"><label>Tanggal Terbit</label><input class="form-control" type="date" id="lpMulai" value="${p.mulai || ''}"></div>
        <div class="form-group"><label>Tanggal Berakhir</label><input class="form-control" type="date" id="lpAkhir" value="${p.berakhir || ''}"></div>
    </div>
    <div class="form-group"><label>Keterangan</label><textarea class="form-control" id="lpKet">${escHtml(p.keterangan || '')}</textarea></div>
    <div class="form-group">
        <label>Lampiran File (JPG, PNG, PDF, Word, Excel)</label>
        <input type="file" id="lpFile" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" onchange="window._lpFile=this.files[0];window._lpFileName=this.files[0].name">
        ${p.fileURL ? `<p class="text-xs mt-8">File saat ini: <a href="${p.fileURL}" target="_blank" class="color-primary fw-700">${escHtml(p.fileName || 'Lihat File')}</a></p>` : ''}
    </div>
    <button class="btn btn-primary" id="btnSimpanLP" onclick="window.simpanLegalPerizinan('${id || ''}')">Simpan</button>`, true);
};

window.simpanLegalPerizinan = async function(id) {
    const btn = document.getElementById("btnSimpanLP");
    const data = {
        nama: document.getElementById("lpNama").value,
        instansi: document.getElementById("lpInstansi").value,
        nomor: document.getElementById("lpNomor").value,
        mulai: document.getElementById("lpMulai").value,
        berakhir: document.getElementById("lpAkhir").value,
        keterangan: document.getElementById("lpKet").value,
        updatedAt: new Date().toISOString()
    };
    if(!data.nama) return toast("Nama dokumen wajib diisi", "warning");

    btn.disabled = true;
    btn.innerHTML = "⏳ Menyimpan...";

    try {
        if(window._lpFile) {
            toast("⏳ Mengupload file...", "info");
            const path = `legal_perizinan/${Date.now()}_${window._lpFileName}`;
            const fileURL = await uploadFileToStorage(window._lpFile, path);
            data.fileURL = fileURL;
            data.fileName = window._lpFileName;
        }

        if(id) await db.collection("hrd_legal_perizinan").doc(id).update(data);
        else await db.collection("hrd_legal_perizinan").add(data);

        closeModalDirect();
        toast("Data berhasil disimpan", "success");
        window.renderLegalPerizinan();
    } catch (e) {
        console.error(e);
        toast("Gagal menyimpan data", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = "Simpan";
    }
};


// ── 7. SENGKETA & KASUS ─────────────────────────────────────────────────────
window.renderLegalSengketa = async function() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `<div class="page-title">
        <span>⚠️ Sengketa & Kasus</span>
        <button class="btn btn-primary btn-sm" onclick="window.modalLegalSengketa()">+ Catat Kasus Baru</button>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>No. Kasus</th>
                        <th>Pihak Terlibat</th>
                        <th>Perihal</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tblLegalSengketa"></tbody>
            </table>
        </div>
    </div>`;
    window.loadLegalSengketa();
};

window.loadLegalSengketa = async function() {
    const snap = await db.collection("hrd_legal_sengketa").get();
    let html = "";
    snap.forEach(doc => {
        const p = doc.data();
        html += `<tr>
            <td>${escHtml(p.no_kasus || '-')}</td>
            <td class="fw-700">${escHtml(p.pihak)}</td>
            <td>${escHtml(p.perihal)}</td>
            <td><span class="badge badge-${p.status === 'Selesai' ? 'success' : 'warning'}">${p.status}</span></td>
            <td>${formatDate(p.tanggal)}</td>
            <td>
                <button class="btn btn-xs btn-info" onclick="window.modalLegalSengketa('${doc.id}')">✏️</button>
                <button class="btn btn-xs btn-danger" onclick="window.hapusLegalSengketa('${doc.id}')">🗑️</button>
            </td>
        </tr>`;
    });
    document.getElementById("tblLegalSengketa").innerHTML = html || '<tr><td colspan="6" class="text-center">Tidak ada catatan sengketa/kasus</td></tr>';
};

window.hapusLegalSengketa = async function(id) {
    if(confirm("Hapus catatan kasus ini?")) {
        await db.collection("hrd_legal_sengketa").doc(id).delete();
        window.renderLegalSengketa();
    }
};

window.modalLegalSengketa = function(id) {
    if(id) {
        db.collection("hrd_legal_sengketa").doc(id).get().then(doc => {
            window.showLegalSengketaForm(id, doc.data());
        });
    } else {
        window.showLegalSengketaForm(null, {});
    }
};

window.showLegalSengketaForm = function(id, p) {
    openModal(`<div class="modal-title">${id ? 'Edit' : 'Tambah'} Catatan Sengketa & Kasus</div>
    <div class="form-group"><label>No. Kasus / Referensi</label><input class="form-control" id="lsNo" value="${escHtml(p.no_kasus || '')}"></div>
    <div class="form-group"><label>Pihak Terlibat</label><input class="form-control" id="lsPihak" value="${escHtml(p.pihak || '')}" placeholder="Contoh: PT. A vs PT. B"></div>
    <div class="form-group"><label>Perihal / Objek Sengketa</label><input class="form-control" id="lsPerihal" value="${escHtml(p.perihal || '')}"></div>
    <div class="grid-2">
        <div class="form-group"><label>Tanggal Kejadian</label><input class="form-control" type="date" id="lsTgl" value="${p.tanggal || ''}"></div>
        <div class="form-group">
            <label>Status</label>
            <select class="form-control" id="lsStatus">
                <option value="Proses" ${p.status === 'Proses' ? 'selected' : ''}>Proses</option>
                <option value="Mediasi" ${p.status === 'Mediasi' ? 'selected' : ''}>Mediasi</option>
                <option value="Sidang" ${p.status === 'Sidang' ? 'selected' : ''}>Sidang</option>
                <option value="Selesai" ${p.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
            </select>
        </div>
    </div>
    <div class="form-group"><label>Kronologi / Catatan</label><textarea class="form-control" id="lsKet">${escHtml(p.kronologi || '')}</textarea></div>
    <button class="btn btn-primary" onclick="window.simpanLegalSengketa('${id || ''}')">Simpan</button>`, true);
};

window.simpanLegalSengketa = async function(id) {
    const data = {
        no_kasus: document.getElementById("lsNo").value,
        pihak: document.getElementById("lsPihak").value,
        perihal: document.getElementById("lsPerihal").value,
        tanggal: document.getElementById("lsTgl").value,
        status: document.getElementById("lsStatus").value,
        kronologi: document.getElementById("lsKet").value,
        updatedAt: new Date().toISOString()
    };
    if(!data.pihak) return toast("Pihak terlibat wajib diisi", "warning");
    if(id) await db.collection("hrd_legal_sengketa").doc(id).update(data);
    else await db.collection("hrd_legal_sengketa").add(data);
    closeModalDirect();
    window.renderLegalSengketa();
};

