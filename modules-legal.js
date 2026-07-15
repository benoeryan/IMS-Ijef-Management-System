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
                            <option>Calibri</option><option>Arial</option><option>Times New Roman</option><option>Segoe UI</option><option>Verdana</option><option>Tahoma</option><option>Georgia</option>
                        </select>
                        <select class="dr-select-compact" id="fontSize" onchange="window.formatDoc('fontSize', this.value)" style="width:50px">
                            <option value="2">10</option><option value="3" selected>12</option><option value="4">14</option><option value="5">18</option><option value="6">24</option>
                        </select>
                    </div>
                    <div style="display:flex; gap:2px">
                        <button class="dr-btn-style" onclick="window.formatDoc('bold')"><b>B</b></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('italic')"><i>I</i></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('underline')"><u>U</u></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('strikeThrough')"><s>abc</s></button>
                        <div class="dr-v-sep"></div>
                        <div class="dr-color-wrap"><input type="color" onchange="window.formatDoc('foreColor', this.value)"><span>A</span></div>
                    </div>
                </div>
                <div class="dr-grp-label">Font</div>
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
                    <button class="dr-btn-large" onclick="window.formatDoc('pageBreak')"><span class="dr-icon">📑</span><label>Page Break</label></button>
                    <button class="dr-btn-large" onclick="window.insertDrTable()"><span class="dr-icon">📊</span><label>Table</label></button>
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
                    <button class="dr-btn-large" onclick="toast('Text Direction','info')"><span class="dr-icon">⬇️</span><label>Text<br>Direction</label></button>
                    <button class="dr-btn-large" onclick="window.setDrMargins('2.5cm')"><span class="dr-icon">↔️</span><label>Margins</label></button>
                    <button class="dr-btn-large" onclick="window.setDrOrientation('portrait')"><span class="dr-icon">↕️</span><label>Orientation</label></button>
                    <button class="dr-btn-large" onclick="window.setDrSize('A4')"><span class="dr-icon">📏</span><label>Size</label></button>
                    <button class="dr-btn-large" onclick="window.formatDoc('insertHTML', '<div style=\'column-count:2\'></div>')"><span class="dr-icon">📑</span><label>Columns</label></button>
                    <div class="dr-stacked-tools" style="margin-left:10px">
                        <button class="dr-btn-compact" onclick="toast('Breaks','info')">📑 Breaks ▾</button>
                        <button class="dr-btn-compact" onclick="toast('Line Numbers','info')">🔢 Line Numbers ▾</button>
                        <button class="dr-btn-compact" onclick="toast('Hyphenation','info')">abc Hyphenation ▾</button>
                    </div>
                </div>
                <div class="dr-grp-label">Page Setup</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap" style="gap:15px">
                    <div style="display:flex; flex-direction:column; gap:4px">
                        <div style="display:flex; align-items:center; gap:8px"><label style="font-size:11px; width:45px">Left:</label><input type="number" class="dr-input-mini" value="0" onchange="window.setDrIndent('left', this.value)"></div>
                        <div style="display:flex; align-items:center; gap:8px"><label style="font-size:11px; width:45px">Right:</label><input type="number" class="dr-input-mini" value="0" onchange="window.setDrIndent('right', this.value)"></div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px">
                        <div style="display:flex; align-items:center; gap:8px"><label style="font-size:11px; width:45px">Before:</label><input type="number" class="dr-input-mini" value="0" onchange="window.setDrSpacing('before', this.value)"></div>
                        <div style="display:flex; align-items:center; gap:8px"><label style="font-size:11px; width:45px">After:</label><input type="number" class="dr-input-mini" value="8" onchange="window.setDrSpacing('after', this.value)"></div>
                    </div>
                </div>
                <div class="dr-grp-label">Paragraph</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="toast('Position','info')"><span class="dr-icon">📍</span><label>Position</label></button>
                    <button class="dr-btn-large" onclick="toast('Wrap Text','info')"><span class="dr-icon">📝</span><label>Wrap<br>Text</label></button>
                    <button class="dr-btn-large" onclick="toast('Selection Pane','info')"><span class="dr-icon">🔳</span><label>Selection<br>Pane</label></button>
                    <div class="dr-stacked-tools" style="margin-left:10px">
                        <button class="dr-btn-compact" onclick="toast('Align','info')">📊 Align ▾</button>
                        <button class="dr-btn-compact" onclick="toast('Group','info')">🧱 Group ▾</button>
                        <button class="dr-btn-compact" onclick="toast('Rotate','info')">🔄 Rotate ▾</button>
                    </div>
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
                </div>
                <div class="dr-grp-label">Footnotes</div>
            </div>`;
    } else if (tabId === "review") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.onAnalyzeRequested()"><span class="dr-icon">🧐</span><label>Legal Review</label></button>
                    <button class="dr-btn-large" onclick="window.translateDoc()"><span class="dr-icon">🌐</span><label>Translate</label></button>
                </div>
                <div class="dr-grp-label">Proofing / Language</div>
            </div>`;
    } else if (tabId === "view") {
        html += `
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.setDocView('read')"><span class="dr-icon">📖</span><label>Read<br>Mode</label></button>
                    <button class="dr-btn-large" onclick="window.setDocView('print')"><span class="dr-icon">📄</span><label>Print<br>Layout</label></button>
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="toast('Outline View','info')">📋 Outline</button>
                        <button class="dr-btn-compact" onclick="toast('Draft View','info')">📑 Draft</button>
                    </div>
                </div>
                <div class="dr-grp-label">Views</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="toast('Focus Mode','info')"><span class="dr-icon">🔲</span><label>Focus</label></button>
                    <button class="dr-btn-large" onclick="toast('Immersive Reader','info')"><span class="dr-icon">🔊</span><label>Immersive<br>Reader</label></button>
                </div>
                <div class="dr-grp-label">Immersive</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="toast('Vertical Movement','info')"><span class="dr-icon">↕️</span><label>Vertical</label></button>
                    <button class="dr-btn-large" onclick="toast('Side to Side','info')"><span class="dr-icon">↔️</span><label>Side to Side</label></button>
                </div>
                <div class="dr-grp-label">Page Movement</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap" style="flex-direction:column; gap:2px; align-items:flex-start">
                    <label style="font-size:11px"><input type="checkbox" checked onchange="window.toggleRuler(this.checked)"> Ruler</label>
                    <label style="font-size:11px"><input type="checkbox" onchange="window.toggleGrid(this.checked)"> Gridlines</label>
                    <label style="font-size:11px"><input type="checkbox" onchange="window.toggleNavPane(this.checked)"> Navigation Pane</label>
                </div>
                <div class="dr-grp-label">Show</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="window.setDocZoom(1.2)"><span class="dr-icon">🔍</span><label>Zoom</label></button>
                    <button class="dr-btn-large" onclick="window.setDocZoom(1)"><span class="dr-icon">💯</span><label>100%</label></button>
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="window.setDocZoom(1)">📄 One Page</button>
                        <button class="dr-btn-compact" onclick="window.setDocZoom(0.8)">📑 Multiple Pages</button>
                        <button class="dr-btn-compact" onclick="window.setDocZoom('page')">↔️ Page Width</button>
                    </div>
                </div>
                <div class="dr-grp-label">Zoom</div>
            </div>
            <div class="dr-ribbon-grp">
                <div class="dr-actions-wrap">
                    <button class="dr-btn-large" onclick="toast('New Window','info')"><span class="dr-icon">➕</span><label>New<br>Window</label></button>
                    <button class="dr-btn-large" onclick="toast('Arrange All','info')"><span class="dr-icon">🪟</span><label>Arrange All</label></button>
                    <button class="dr-btn-large" onclick="toast('Split Window','info')"><span class="dr-icon">✂️</span><label>Split</label></button>
                </div>
                <div class="dr-grp-label">Window</div>
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
            .off-header { background: var(--off-blue); height: 48px; display: flex; align-items: center; padding: 0 15px; gap: 20px; color: #fff; }
            .off-tab-bar { background: var(--off-blue); display: flex; align-items: flex-end; padding-top: 4px; }
            .off-tab {
                padding: 6px 16px; cursor: pointer; color: #fff; font-size: 13px;
                border-bottom: 3px solid transparent; transition: 0.2s;
            }
            .off-tab.active { background: #f3f2f1; color: var(--off-blue); font-weight: 600; }

            .off-ribbon {
                background: #f3f2f1; height: 95px; border-bottom: 1px solid #ddd;
                display: flex; padding: 5px; gap: 2px; overflow-x: auto;
            }
            .dr-ribbon-grp {
                display: flex; flex-direction: column; align-items: center;
                padding: 0 10px; border-right: 1px solid #ddd; height: 100%;
            }
            .dr-actions-wrap { display: flex; align-items: center; flex: 1; gap: 8px; }
            .dr-grp-label { font-size: 10px; color: #666; margin-top: auto; padding-bottom: 2px; }

            .dr-btn-large {
                background: transparent; border: 1px solid transparent;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                gap: 2px; padding: 4px; border-radius: 4px; cursor: pointer; min-width: 60px;
            }
            .dr-btn-large:hover { background: #e1dfdd; }
            .dr-btn-large .dr-icon { font-size: 1.6rem; line-height: 1; }
            .dr-btn-large label { font-size: 10px; cursor: pointer; text-align: center; }

            .dr-stacked-tools { display: flex; flex-direction: column; gap: 2px; }
            .dr-btn-compact {
                background: transparent; border: none; padding: 2px 6px; border-radius: 2px;
                font-size: 11px; display: flex; align-items: center; gap: 6px; cursor: pointer;
            }
            .dr-btn-compact:hover { background: #e1dfdd; }

            .dr-select-compact { border: 1px solid #ddd; background: #fff; height: 22px; font-size: 11px; padding: 0 4px; }
            .dr-btn-style { width: 24px; height: 24px; border: 1px solid transparent; background: transparent; cursor: pointer; }
            .dr-btn-style:hover { background: #e1dfdd; }
            .dr-v-sep { width: 1px; height: 20px; background: #ddd; margin: 0 4px; }
            .dr-color-wrap { position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
            .dr-color-wrap input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
            .dr-color-wrap span { font-weight: bold; border-bottom: 3px solid #000; line-height: 1; }

            .dr-styles-shelf { display: flex; gap: 5px; height: 100%; align-items: center; }
            .dr-style-card {
                width: 75px; height: 65px; border: 1px solid #ddd; background: #fff;
                display: flex; flex-direction: column; padding: 4px; cursor: pointer;
            }
            .dr-style-card.active { border-color: var(--off-blue); background: #f0f4ff; }
            .dr-style-card .preview { flex: 1; color: #666; font-size: 0.7rem; }
            .dr-style-card label { font-size: 9px; font-weight: 600; }

            .off-main { display: flex; flex: 1; overflow: hidden; }
            .off-canvas {
                flex: 1; background: #e1dfdd; overflow: auto; display: flex;
                flex-direction: column; align-items: center; padding: 40px 10px;
            }
            .dr-page-a4 {
                background: white; width: 210mm; min-height: 297mm; color: #000;
                padding: 2.5cm; box-shadow: var(--off-shadow); position: relative;
                transform-origin: top center; transition: transform 0.2s;
            }
            .dr-header-box { position: absolute; top: 1cm; left: 2.5cm; right: 2.5cm; height: 1cm; font-size: 9pt; color: #999; outline: none; border-bottom: 1px dashed transparent; }
            .dr-footer-box { position: absolute; bottom: 1cm; left: 2.5cm; right: 2.5cm; height: 1cm; font-size: 9pt; color: #999; outline: none; border-top: 1px dashed transparent; }
            .dr-header-box:focus, .dr-footer-box:focus { border-color: var(--off-blue); }

            .dr-editor { width: 100%; min-height: 100%; outline: none; font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.15; text-align: justify; }

            .off-ai-sidebar { width: 350px; background: #fff; border-left: 1px solid #ddd; display: flex; flex-direction: column; }
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
            @media print { .off-header, .off-ribbon, .off-ai-sidebar, .off-status { display: none !important; } .off-canvas { padding: 0; background: #fff; } .dr-page-a4 { box-shadow: none; margin: 0; } }
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
                <div class="off-canvas">
                    <div class="dr-page-a4" id="suitePage">
                        <div class="dr-header-box" id="suiteHeader" contenteditable="true">Header Text...</div>
                        <div class="dr-editor" id="suiteEditor" contenteditable="true">
                            <p style="text-align:center"><b>[JUDUL DOKUMEN]</b></p>
                            <p style="text-align:center">Nomor: [NOMOR_SURAT]</p><br>
                            <p>Mulai ketik draf hukum Anda di sini...</p>
                        </div>
                        <div class="dr-footer-box" id="suiteFooter" contenteditable="true">Footer Text...</div>
                    </div>
                </div>
                <div class="off-ai-sidebar">
                    <div class="ai-head">✨ Gemini Legal AI</div>
                    <div class="ai-chat" id="suiteAiChat"><div class="ai-msg bot">Halo! Saya Gemini Legal AI. Apa yang bisa saya bantu?</div></div>
                    <div class="ai-input-area">
                        <textarea class="ai-box" id="suiteAiInput" placeholder="Ketik perintah..."></textarea>
                        <button class="ai-send-btn" onclick="window.askGemini()">Ask Gemini ✨</button>
                    </div>
                </div>
            </div>
            <div class="off-status"><span>Page 1 of 1</span><span>0 words</span></div>
            <input type="file" id="drImgImport" style="display:none" accept="image/*" onchange="window.handleImageUpload(this)">
        </div>
    `, true);
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
    reader.onload = (e) => window.formatDoc('insertHTML', `<img src="${e.target.result}" style="max-width:100%">`);
    if(input.files[0]) reader.readAsDataURL(input.files[0]);
};
window.insertDrTable = function() {
    const r = prompt("Rows:","3"), c = prompt("Cols:","3");
    let h = '<table style="width:100%; border-collapse:collapse; border:1px solid #ddd">';
    for(let i=0; i<r; i++){ h+='<tr>'; for(let j=0; j<c; j++) h+='<td style="border:1px solid #ddd; padding:8px"></td>'; h+='</tr>'; }
    window.formatDoc('insertHTML', h + '</table>');
};
window.setDrIndent = function(side, val) { document.getElementById("suiteEditor").style[side === 'left' ? 'paddingLeft' : 'paddingRight'] = val + 'cm'; };
window.setDrSpacing = function(type, val) { document.getElementById("suiteEditor").style[type === 'before' ? 'marginTop' : 'marginBottom'] = val + 'pt'; };
window.saveDraft = function() { toast("Draft saved", "success"); };

window.setDocZoom = function(val) {
    const page = document.getElementById("suitePage");
    if (!page) return;
    if (val === 'page') {
        page.style.transform = "scale(1)";
        page.style.width = "100%";
    } else {
        page.style.transform = `scale(${val})`;
        page.style.width = "210mm";
    }
    toast(`Zoom set to ${val === 'page' ? 'Page Width' : (val*100)+'%'}`, "info");
};

window.formatDoc = function(cmd, val) {
    if (cmd === 'pageBreak') {
        const html = '<div style="page-break-after:always; border-bottom:2px dotted #ccc; margin:20px 0; text-align:center; color:#999; font-size:10px">PAGE BREAK</div>';
        document.execCommand('insertHTML', false, html);
    } else {
        document.execCommand(cmd, false, val);
    }
    document.getElementById("suiteEditor").focus();
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

window.toggleRuler = function(show) { document.getElementById("suiteRuler").style.display = show ? "flex" : "none"; };
window.toggleGrid = function(show) { document.getElementById("suiteEditor").style.backgroundImage = show ? "linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)" : "none"; document.getElementById("suiteEditor").style.backgroundSize = "20px 20px"; };
window.toggleNavPane = function(show) { toast("Navigation Pane " + (show ? "ON" : "OFF"), "info"); };
window.setDocView = function(view) {
    const canvas = document.querySelector(".off-canvas");
    canvas.style.background = view === 'read' ? "#fff" : "#e1dfdd";
    toast("View: " + view, "info");
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

