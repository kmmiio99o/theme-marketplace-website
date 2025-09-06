export async function showBuildingPage(request, env) {
  const htmlContent = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Fizz Theme Studio — Alpha JSON Builder</title>
<link rel="icon" href="https://kmmiio99o.pages.dev/icons/palette.png" type="image/png">
<style>
  :root{
    --brand:#2ea8ff; --brandHover:#166dce;
    --text:#d6e8ff; --muted:#a8c6ff; --textPrimary:#e7f1ff; --textSecond:#b9d4ff; --link:#2ea8ff;
    --bgPrimary:#0f0f10; --bgSecondary:#121214; --bgAlt:#101012; --bgTertiary:#0c0c0e; --bgFloating:#0f0f12; --bgNested:#0e0e10;
    --cardPrimary:#0e0e10; --cardSecondary:#0f0f12; --input:#121214;
    --success:#43b581; --warning:#f5b14d; --danger:#e04f5f;
    --ripple:#2a5d9c; --scrollbar:#2b2b2b;
  }
  *{box-sizing:border-box}
  html,body{height:100%;margin:0;background:var(--bgPrimary);color:var(--text);font:14px/1.4 system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  .app{display:grid;grid-template-columns:340px 1fr;gap:0;height:100%}
  .panel{background:var(--bgSecondary);border-right:1px solid rgba(255,255,255,.05);padding:14px;overflow:auto}
  .panel h1{font-size:18px;margin:0;color:var(--textPrimary)}
  .panel h2{font-size:13px;margin:18px 0 6px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
  .panel-header{display: flex; align-items: center; gap: 8px; margin-bottom: 8px;}
  .row{display:grid;grid-template-columns:1fr 120px;gap:8px;align-items:center;margin:6px 0}
  .row label{font-size:13px;color:var(--text)}
  .row input[type="text"]{width:100%;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.07);background:var(--input);color:var(--text)}
  .row input[type="color"]{width:100%;height:36px;border:1px solid rgba(255,255,255,.15);border-radius:8px;background:#0000}
  .btns{display:flex;gap:8px;margin:12px 0;flex-wrap:wrap}
  button{padding:8px 10px;border:1px solid rgba(255,255,255,.15);border-radius:8px;background:var(--bgAlt);color:var(--text);cursor:pointer}
  button.primary{background:var(--brand);border-color:transparent;color:#04121e;font-weight:600}
  button:active{transform:translateY(1px)}
  .preview{display:grid;grid-template-columns:64px 260px 1fr;height:100vh;overflow:hidden}
  .sv{background:var(--bgTertiary);display:flex;flex-direction:column;gap:6px;align-items:center;padding:8px 0;border-right:1px solid rgba(255,255,255,.05)}
  .sv .dot{width:38px;height:38px;border-radius:50%;background:linear-gradient(145deg,var(--bgAlt),var(--bgSecondary));border:1px solid rgba(255,255,255,.06)}
  .channels{background:var(--bgSecondary);border-right:1px solid rgba(255,255,255,.05);padding:10px;overflow:auto}
  .channels h3{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:8px 0}
  .chan{display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:8px;color:var(--muted)}
  .chan.active{background:var(--bgAlt);color:var(--text)}
  .chan .hash{opacity:.7}
  .chat{display:grid;grid-template-rows:auto 1fr auto;height:100%}
  .header{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid rgba(255,255,255,.05);background:var(--bgFloating)}
  .header .title{font-weight:600;color:var(--textPrimary)}
  .header .pill{margin-left:auto;background:var(--bgAlt);padding:6px 8px;border-radius:999px;color:var(--muted);font-size:12px}
  .msgs{padding:14px;overflow:auto;background:var(--bgPrimary)}
  .msg{margin:10px 0}
  .nick{color:var(--textPrimary);font-weight:600;margin-right:6px}
  .time{color:var(--muted);font-size:12px;margin-left:6px}
  .bubble{background:var(--cardPrimary);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px 12px;display:inline-block}
  a{color:var(--link);text-decoration:none}
  a:hover{color:var(--brandHover)}
  code{background:var(--bgAlt);padding:2px 6px;border-radius:6px;border:1px solid rgba(255,255,255,.08);color:var(--text)}
  .quote{border-left:3px solid rgba(255,255,255,.15);padding-left:10px;color:var(--muted)}
  .mention{color:var(--brand);font-weight:700}
  .spoiler{background:var(--bgAlt);color:var(--bgAlt);padding:2px 6px;border-radius:6px}
  .spoiler:hover{color:var(--text)}
  .input{padding:10px;border-top:1px solid rgba(255,255,255,.05);background:var(--input);display:flex;gap:8px}
  .input input{flex:1;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:var(--bgAlt);color:var(--text)}
  .json{margin-top:10px}
  textarea{width:100%;min-height:220px;background:#0b0b0d;color:#d0d0d5;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  .mini{font-size:12px;color:var(--muted);margin:6px 0 0}
  .hr{height:1px;background:rgba(255,255,255,.06);margin:10px 0}
  @media (max-width: 980px){ .app{grid-template-columns:1fr} .preview{display:none} }
</style>
</head>
<body>
<div class="app">
  <div class="panel">
    <div class="panel-header">
      <a href="/"><button>Go Back</button></a>
      <h1>Theme Studio by <a href="https://github.com/FizzvrDev">Fizz</a></h1>
    </div>
    <div class="btns">
      <button id="preset-blue" class="primary">Preset: Pastel Blue</button>
      <button id="preset-purple">Preset: Purple Vision</button>
    </div>

    <h2>Meta</h2>
    <div class="row"><label>Name</label><input id="name" type="text" value="Cobalt Vision (Alpha Dark)"/></div>
    <div class="row"><label>Description</label><input id="desc" type="text" value="Midnight alpha schema with a cobalt/azure palette. Dark server list + dark chat, crisp blue accents."/></div>
    <div class="row"><label>Version</label><input id="ver" type="text" value="3"/></div>
    <div class="row"><label>Icon Pack</label><input id="iconPack" type="text" value="rosiecord-plumpy"/></div>

    <h2>Authors</h2>
    <div class="row"><label>Author 1 name</label><input id="a1n" type="text" value="hi"/></div>
    <div class="row"><label>Author 1 id</label><input id="a1i" type="text" value="Fizz was here"/></div>


    <h2>Accent & Text</h2>
    <div class="row"><label>Brand</label><input id="brand" type="color" value="#2ea8ff"/></div>
    <div class="row"><label>Brand Hover</label><input id="brandHover" type="color" value="#166dce"/></div>
    <div class="row"><label>Text Normal</label><input id="text" type="color" value="#d6e8ff"/></div>
    <div class="row"><label>Text Muted</label><input id="muted" type="color" value="#a8c6ff"/></div>
    <div class="row"><label>Text Primary</label><input id="textPrimary" type="color" value="#e7f1ff"/></div>
    <div class="row"><label>Text Secondary</label><input id="textSecond" type="color" value="#b9d4ff"/></div>
    <div class="row"><label>Link</label><input id="link" type="color" value="#2ea8ff"/></div>

    <h2>Surfaces</h2>
    <div class="row"><label>Background Primary</label><input id="bgPrimary" type="color" value="#0f0f10"/></div>
    <div class="row"><label>Background Secondary</label><input id="bgSecondary" type="color" value="#121214"/></div>
    <div class="row"><label>Background Alt</label><input id="bgAlt" type="color" value="#101012"/></div>
    <div class="row"><label>Background Tertiary</label><input id="bgTertiary" type="color" value="#0c0c0e"/></div>
    <div class="row"><label>Floating</label><input id="bgFloating" type="color" value="#0f0f12"/></div>
    <div class="row"><label>Nested</label><input id="bgNested" type="color" value="#0e0e10"/></div>

    <h2>Cards & Inputs</h2>
    <div class="row"><label>Card Primary</label><input id="cardPrimary" type="color" value="#0e0e10"/></div>
    <div class="row"><label>Card Secondary</label><input id="cardSecondary" type="color" value="#0f0f12"/></div>
    <div class="row"><label>Input</label><input id="input" type="color" value="#121214"/></div>

    <h2>Status</h2>
    <div class="row"><label>Success</label><input id="success" type="color" value="#43b581"/></div>
    <div class="row"><label>Warning</label><input id="warning" type="color" value="#f5b14d"/></div>
    <div class="row"><label>Danger</label><input id="danger" type="color" value="#e04f5f"/></div>

    <h2>Misc</h2>
    <div class="row"><label>Ripple</label><input id="ripple" type="color" value="#2a5d9c"/></div>
    <div class="row"><label>Scrollbar</label><input id="scrollbar" type="color" value="#2b2b2b"/></div>

    <div class="hr"></div>
    <div class="btns">
      <button id="copyJson" class="primary">Copy JSON</button>
      <button id="downloadJson">Download JSON</button>
      </div>
    <div class="mini">Exports Cobalt/Alpha-compatible JSON: arrays-of-one, full ramps, PLUM_*, GUILD_BOOSTING_*, etc.</div>

    <h2>Generated JSON</h2>
    <div class="json">
      <textarea id="jsonOut" readonly></textarea>
    </div>
  </div>

  <div class="preview">
    <div class="sv">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div>
    </div>
    <div class="channels">
      <h3>text channels</h3>
      <div class="chan active"><span class="hash">#</span><span>general</span></div>
      <div class="chan"><span class="hash">#</span><span>announcements</span></div>
      <div class="chan"><span class="hash">#</span><span>showcase</span></div>
      <div class="chan"><span class="hash">#</span><span>support</span></div>
      <h3>voice channels</h3>
      <div class="chan"><span class="hash">🔊</span><span>Chill</span></div>
    </div>
    <div class="chat">
      <div class="header">
        <div class="title"># general</div>
        <div class="pill">Live Preview</div>
      </div>
      <div class="msgs">
        <div class="msg">
          <span class="nick">Nova</span><span class="time">Today 12:34</span>
          <div class="bubble">Check the <a href="#">docs</a> and run <code>npm run build</code>.</div>
        </div>
        <div class="msg">
          <span class="nick">Fizz</span><span class="time">12:36</span>
          <div class="bubble"><span class="mention">@you</span> &gt; Quote looks like this<br><span class="quote">Nested quote with muted text</span></div>
        </div>
        <div class="msg">
          <span class="nick">Luna</span><span class="time">12:38</span>
          <div class="bubble">Spoiler: <span class="spoiler">secret</span> — selected/hover states test.</div>
        </div>
      </div>
      <div class="input">
        <input placeholder="Message #general"/>
        <button class="primary">Send</button>
      </div>
    </div>
  </div>
</div>

<script>
const $ = s => document.querySelector(s);

// Defaults to prevent blanks
const DEFAULTS = {
  brand:"#2ea8ff", brandHover:"#166dce",
  textNormal:"#d6e8ff", textMuted:"#a8c6ff", textPrimary:"#e7f1ff", textSecond:"#b9d4ff", textLink:"#2ea8ff",
  bgPrimary:"#0f0f10", bgSecondary:"#121214", bgAlt:"#101012", bgTertiary:"#0c0c0e", bgFloating:"#0f0f12", bgNested:"#0e0e10",
  cardPrimary:"#0e0e10", cardSecondary:"#0f0f12", input:"#121214",
  success:"#43b581", warning:"#f5b14d", danger:"#e04f5f",
  ripple:"#2a5d9c", scrollbar:"#2b2b2b",
  name:"Cobalt Vision (Alpha Dark)",
  description:"Midnight alpha schema with a cobalt/azure palette. Dark server list + dark chat, crisp blue accents.",
  version:"3",
  iconPack:"rosiecord-plumpy",
  mentionLine:"#8ecbff"
};
const getVal = (id, key) => {
  const v = (document.getElementById(id)?.value ?? "").trim();
  return v || DEFAULTS[key];
};

// Hook inputs
const fields = [
  "brand","brandHover","text","muted","textPrimary","textSecond","link",
  "bgPrimary","bgSecondary","bgAlt","bgTertiary","bgFloating","bgNested",
  "cardPrimary","cardSecondary","input","success","warning","danger","ripple","scrollbar"
];
for (const k of fields) { const el=document.getElementById(k); if(el) el.addEventListener("input", applyVars); }
["name","desc","ver","iconPack","a1n","a1i","a2n","a2i"].forEach(id => { const el=document.getElementById(id); if(el) el.addEventListener("input", buildJSON); });

// Presets
document.getElementById("preset-blue").addEventListener("click", ()=>{
  const p={brand:"#2ea8ff",brandHover:"#166dce",text:"#d6e8ff",muted:"#a8c6ff",textPrimary:"#e7f1ff",textSecond:"#b9d4ff",link:"#2ea8ff",
    bgPrimary:"#0f0f10",bgSecondary:"#121214",bgAlt:"#101012",bgTertiary:"#0c0c0e",bgFloating:"#0f0f12",bgNested:"#0e0e10",
    cardPrimary:"#0e0e10",cardSecondary:"#0f0f12",input:"#121214",success:"#43b581",warning:"#f5b14d",danger:"#e04f5f",ripple:"#2a5d9c",scrollbar:"#2b2b2b"};
  for(const k in p){ const el=document.getElementById(k); if(el) el.value=p[k]; } applyVars();
});
document.getElementById("preset-purple").addEventListener("click", ()=>{
  const p={brand:"#8200c8",brandHover:"#3d007a",text:"#cbadff",muted:"#d359ff",textPrimary:"#e9d9ff",textSecond:"#d79dff",link:"#8200c8",
    bgPrimary:"#0f0f10",bgSecondary:"#121214",bgAlt:"#101012",bgTertiary:"#0c0c0e",bgFloating:"#0f0f12",bgNested:"#0e0e10",
    cardPrimary:"#0e0e10",cardSecondary:"#0f0f12",input:"#121214",success:"#43b581",warning:"#faa61a",danger:"#7f007b",ripple:"#5b2a82",scrollbar:"#2b2b2b"};
  for(const k in p){ const el=document.getElementById(k); if(el) el.value=p[k]; } applyVars();
});

function applyVars(){
  for (const k of fields) {
    const el = document.getElementById(k);
    if (!el) continue;
    document.documentElement.style.setProperty("--"+k, el.value);
  }
  buildJSON();
}
function A(v){ return [v]; }

function buildJSON(){
  const P = {
    brand:getVal("brand","brand"),
    brandHover:getVal("brandHover","brandHover"),
    textNormal:getVal("text","textNormal"),
    textMuted:getVal("muted","textMuted"),
    textPrimary:getVal("textPrimary","textPrimary"),
    textSecond:getVal("textSecond","textSecond"),
    textLink:getVal("link","textLink"),
    bgPrimary:getVal("bgPrimary","bgPrimary"),
    bgSecondary:getVal("bgSecondary","bgSecondary"),
    bgAlt:getVal("bgAlt","bgAlt"),
    bgTertiary:getVal("bgTertiary","bgTertiary"),
    bgFloating:getVal("bgFloating","bgFloating"),
    bgNested:getVal("bgNested","bgNested"),
    cardPrimary:getVal("cardPrimary","cardPrimary"),
    cardSecondary:getVal("cardSecondary","cardSecondary"),
    input:getVal("input","input"),
    success:getVal("success","success"),
    warning:getVal("warning","warning"),
    danger:getVal("danger","danger"),
    ripple:getVal("ripple","ripple"),
    scrollbar:getVal("scrollbar","scrollbar")
  };

  // Authors: drop blanks; ensure at least one
  const authorsRaw = [
    { name: (document.getElementById("a1n")?.value || "").trim(), id: (document.getElementById("a1i")?.value || "").trim() },
    { name: (document.getElementById("a2n")?.value || "").trim(), id: (document.getElementById("a2i")?.value || "").trim() }
  ];
  let authors = authorsRaw.filter(a => a.name && a.id);
  if (authors.length === 0) authors = [{ name: "Fizz", id: "629700611994157057" }];

  // === semanticColors (Alpha/Cobalt field set) ===
  const semanticColors = {
    ANDROID_RIPPLE: A(P.ripple),

    CHAT_BACKGROUND: A(P.bgPrimary),

    BACKGROUND_ACCENT: A(P.brand),
    BACKGROUND_FLOATING: A(P.bgFloating),
    BACKGROUND_MENTIONED: A("rgba(114,0,0,0.1)"),
    BACKGROUND_MENTIONED_HOVER: A("rgba(170,0,0,0.1)"),
    BACKGROUND_MESSAGE_HOVER: A("#FFFFFF0D"),
    BACKGROUND_NESTED_FLOATING: A(P.bgNested),
    BACKGROUND_MOBILE_PRIMARY: A(P.bgPrimary),
    BACKGROUND_MOBILE_SECONDARY: A(P.bgSecondary),
    BACKGROUND_MODIFIER_ACCENT: A("#FFFFFF12"),
    BACKGROUND_MODIFIER_ACTIVE: A("#FFFFFF14"),
    BACKGROUND_MODIFIER_HOVER: A("#FFFFFF0F"),
    BACKGROUND_MODIFIER_SELECTED: A("#FFFFFF1A"),
    BACKGROUND_PRIMARY: A(P.bgPrimary),
    BACKGROUND_SECONDARY: A(P.bgSecondary),
    BACKGROUND_SECONDARY_ALT: A(P.bgAlt),
    BACKGROUND_TERTIARY: A(P.bgTertiary),

    BG_BASE_PRIMARY: A(P.bgPrimary),
    BG_BACKDROP: A("#000000b2"),
    BG_BASE_SECONDARY: A(P.bgSecondary),
    BG_BASE_TERTIARY: A(P.bgAlt),

    HOME_BACKGROUND: A(P.bgSecondary),

    BORDER_FAINT: A("#FFFFFF12"),
    BORDER_SUBTLE: A("#FFFFFF1c"),
    BORDER_STRONG: A("#FFFFFF26"),

    CARD_PRIMARY_BG: A(P.cardPrimary),
    CARD_SECONDARY_BG: A(P.cardSecondary),
    CHANNELS_DEFAULT: A(P.textMuted),
    CHANNEL_ICON: A(P.textMuted),
    CHANNELTEXTAREA_BACKGROUND: A(P.input),

    EMBED_BACKGROUND: A(P.bgFloating),

    HEADER_PRIMARY: A(P.textNormal),
    HEADER_SECONDARY: A(P.textMuted),

    INTERACTIVE_ACTIVE: A(P.brand),
    INTERACTIVE_HOVER: A(P.brandHover),
    INTERACTIVE_MUTED: A(P.textMuted),
    INTERACTIVE_NORMAL: A(P.textNormal),

    MENTION_BACKGROUND: A("rgba(114,0,0,0.1)"),
    MENTION_FOREGROUND: A(P.brand),

    REDESIGN_ACTIVITY_CARD_BACKGROUND: A(P.bgAlt),
    REDESIGN_ACTIVITY_CARD_BACKGROUND_PRESSED: A(P.bgSecondary),
    REDESIGN_BUTTON_SECONDARY_ALT_BACKGROUND: A(P.bgAlt),
    REDESIGN_BUTTON_SECONDARY_BACKGROUND: A(P.bgAlt),
    REDESIGN_BUTTON_SECONDARY_BORDER: A("#FFFFFF1A"),
    REDESIGN_BUTTON_DANGER_BACKGROUND: A(P.danger),
    REDESIGN_CHANNEL_CATEGORY_NAME_TEXT: A(P.textMuted),
    REDESIGN_CHANNEL_NAME_TEXT: A(P.textNormal),
    REDESIGN_CHAT_INPUT_BACKGROUND: A(P.input),

    SPOILER_HIDDEN_BACKGROUND: A("#000000"),

    STATUS_DANGER: A(P.danger),
    STATUS_DANGER_BACKGROUND: A(P.danger),
    STATUS_DANGER_TEXT: A(P.bgPrimary),

    POLLS_NORMAL_FILL_HOVER: A(P.bgSecondary),
    POLLS_NORMAL_IMAGE_BACKGROUND: A(P.bgSecondary),
    POLLS_VICTOR_FILL: A(P.success + "80"),

    TEXT_LINK: A(P.brand),
    TEXT_MUTED: A(P.textMuted),
    TEXT_NORMAL: A(P.textNormal),
    TEXT_PRIMARY: A(P.textPrimary),
    TEXT_SECONDARY: A(P.textSecond),

    BG_MOD_FAINT: A("#FFFFFF12"),
    KEYBOARD: A(P.bgAlt),
    BACKGROUND_MODIFIER_ACCEPT: A(P.success + "33"),
    BACKGROUND_MODIFIER_ACCEPT_HOVER: A(P.success + "4d"),
    AUTOMOD_QUEUED_FOR_REVIEW_BACKGROUND: A(P.warning + "33"),
    AUTOMOD_QUEUED_FOR_REVIEW_BACKGROUND_HOVER: A(P.warning + "4d"),

    SCROLLBAR_AUTO_THUMB: A(P.scrollbar),
    SCROLLBAR_AUTO_TRACK: A("transparent"),
    SCROLLBAR_THIN_THUMB: A(P.scrollbar),
    SCROLLBAR_THIN_TRACK: A("transparent")
  };

  // === rawColors (full ramp, PLUM_*, guild boosting) ===
  const rawColors = {
    // BLUE fallback ramp
    BLUE_260:"#5a76a8", BLUE_300:"#5a76a8", BLUE_330:"#5a76a8", BLUE_345:"#5a76a8",
    BLUE_360:"#5a76a8", BLUE_400:"#5a76a8", BLUE_430:"#5a76a8", BLUE_460:"#5a76a8",
    BLUE_500:"#5a76a8", BLUE_530:"#5a76a8", BLUE_560:"#5a76a8", BLUE_600:"#5a76a8",
    BLUE_630:"#5a76a8", BLUE_660:"#5a76a8", BLUE_700:"#5a76a8",

    BLACK_500:"#000000b2",

    // BRAND ramp
    BRAND_200:P.brand, BRAND_260:P.brand, BRAND_300:P.brand, BRAND_330:P.brand,
    BRAND_345:P.brand, BRAND_360:P.brand, BRAND_400:P.brand, BRAND_430:P.brand,
    BRAND_460:P.brand, BRAND_500:P.brand, BRAND_530:P.brand, BRAND_560:P.brandHover,
    BRAND_600:P.brand, BRAND_630:P.brand, BRAND_660:P.brand, BRAND_700:P.brand,
    BRAND_730:P.textNormal,

    // PLUM placeholders mapped to palette (compat)
    PLUM_1:P.textNormal,
    PLUM_3:P.brand,
    PLUM_4:P.textNormal,
    PLUM_6:P.textNormal,
    PLUM_9:P.textMuted,
    PLUM_10:P.textMuted,
    PLUM_11:P.textMuted,
    PLUM_13:P.textMuted,
    PLUM_15:P.brand,
    PLUM_16:P.bgSecondary,
    PLUM_17:P.bgPrimary,
    PLUM_18:P.bgAlt,
    PLUM_19:P.bgSecondary,
    PLUM_20:P.bgPrimary,
    PLUM_21:P.bgSecondary,
    PLUM_22:P.bgSecondary,
    PLUM_24:P.bgPrimary,
    PLUM_25:P.bgPrimary,

    // PRIMARY full ramp
    PRIMARY_100:P.textMuted,
    PRIMARY_200:P.textNormal,
    PRIMARY_300:P.brand,
    PRIMARY_330:P.textNormal,
    PRIMARY_360:P.brand,
    PRIMARY_400:P.brandHover,
    PRIMARY_460:P.bgSecondary,
    PRIMARY_500:P.brand,
    PRIMARY_530:P.brand,
    PRIMARY_600:P.bgPrimary,
    PRIMARY_630:P.bgSecondary,
    PRIMARY_645:P.bgAlt,
    PRIMARY_660:P.bgSecondary,
    PRIMARY_700:P.bgTertiary,
    PRIMARY_730:P.textMuted,
    PRIMARY_800:P.cardSecondary,

    // GREEN ramp collapsed to success
    GREEN_260:P.success, GREEN_300:P.success, GREEN_330:P.success, GREEN_345:P.success,
    GREEN_360:P.success, GREEN_400:P.success, GREEN_430:P.success, GREEN_460:P.success,
    GREEN_500:P.success, GREEN_530:P.success, GREEN_560:P.success, GREEN_600:P.success,
    GREEN_630:P.success, GREEN_660:P.success, GREEN_700:P.success,

    // Guild boosting
    GUILD_BOOSTING_PINK:P.brand,
    GUILD_BOOSTING_PURPLE:P.brand,
    GUILD_BOOSTING_PURPLE_FOR_GRADIENTS:P.brand,

    // RED ramp
    RED_260:P.danger, RED_300:P.danger, RED_330:P.danger, RED_345:P.danger,
    RED_360:P.danger, RED_400:P.danger, RED_430:P.danger, RED_460:P.danger,
    RED_500:P.danger, RED_530:P.danger, RED_560:P.danger, RED_600:P.danger,
    RED_630:P.danger, RED_660:P.danger, RED_700:P.danger,

    // ORANGE/YELLOW ramps mapped to warning
    ORANGE_260:P.warning, ORANGE_300:P.warning, ORANGE_330:P.warning, ORANGE_345:P.warning,
    ORANGE_360:P.warning, ORANGE_400:P.warning, ORANGE_430:P.warning, ORANGE_460:P.warning,
    ORANGE_500:P.warning, ORANGE_530:P.warning, ORANGE_560:P.warning, ORANGE_600:P.warning,
    ORANGE_630:P.warning, ORANGE_660:P.warning, ORANGE_700:P.warning,

    YELLOW_260:P.warning, YELLOW_300:P.warning, YELLOW_330:P.warning, YELLOW_345:P.warning,
    YELLOW_360:P.warning, YELLOW_400:P.warning, YELLOW_430:P.warning, YELLOW_460:P.warning,
    YELLOW_500:P.warning, YELLOW_530:P.warning, YELLOW_560:P.warning, YELLOW_600:P.warning,
    YELLOW_630:P.warning, YELLOW_660:P.warning, YELLOW_700:P.warning,

    WHITE_500:P.textNormal,
    WHITE_630:P.textMuted,

    ROLE_DEFAULT:P.textMuted
  };

  const obj = {
    name: getVal("name","name"),
    description: getVal("desc","description"),
    version: getVal("ver","version"),
    authors,
    semanticColors,
    rawColors,
    plus: {
      version: "0",
      iconPack: getVal("iconPack","iconPack"),
      mentionLineColor: DEFAULTS.mentionLine
    },
    spec: 2
  };

  const out = document.getElementById("jsonOut");
  if (out) out.value = JSON.stringify(obj, null, 2);
}

// Controls
document.getElementById("copyJson").addEventListener("click", ()=>{
  const ta = document.getElementById("jsonOut");
  if (!ta) return;
  ta.select(); document.execCommand("copy");
  const btn = document.getElementById("copyJson"); btn.textContent="Copied!"; setTimeout(()=>btn.textContent="Copy JSON",1200);
});
document.getElementById("downloadJson").addEventListener("click", ()=>{
  const ta = document.getElementById("jsonOut"); if (!ta) return;
  const blob = new Blob([ta.value], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = (getVal("name","name") || "theme") + ".json";
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
});
// Removed the "openJson" button and its functionality
// document.getElementById("openJson").addEventListener("click", ()=>{
//   const ta = document.getElementById("jsonOut"); if (!ta) return;
//   const data = "data:application/json;charset=utf-8," + encodeURIComponent(ta.value);
//   window.open(data, "_blank");
// });


// Init
applyVars(); // Initial application of variables and JSON generation
</script>
</body>
</html>`;

  return new Response(htmlContent, {
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
    },
  });
}
