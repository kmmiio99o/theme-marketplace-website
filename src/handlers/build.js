export async function showBuildingPage(request, env) {
  const htmlContent = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Theme Studio — Mobile (Alpha)</title>
<link rel="icon" href="https://kmmiio99o.pages.dev/icons/palette.png" type="image/png">
<style>
:root {
  /* Live palette (overridden by JS) */
  --brand: #8200c8;
  --brandHover: #3d007a;
  --link: #8200c8;
  --text: #cbadff;
  --muted: #d359ff;
  --textPrimary: #e9d9ff;
  --textSecond: #d79dff;
  --bgPrimary: #0f0f10;
  --bgSecondary: #121214;
  --bgAlt: #101012;
  --bgTertiary: #0c0c0e;
  --bgFloating: #0f0f12;
  --bgNested: #0e0e10;
  --cardPrimary: #0e0e10;
  --cardSecondary: #0f0f12;
  --input: #121214;
  --success: #43b581;
  --warning: #faa61a;
  --danger: #7f007b;
  --ripple: #5b2a82;
  --scrollbar: #2b2b2b;
  --mentionLine: #b592e6;
  --icon: #cbadff;
  --iconMuted: #8a8a8a;
}
* {
  box-sizing: border-box;
}
html,
body {
  height: 100%;
  margin: 0;
  background: var(--bgPrimary);
  color: var(--text);
  font:
    14px/1.45 Inter,
    system-ui,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
}
.app {
  display: grid;
  grid-template-columns: 360px 1fr;
  height: 100vh;
}
@media (max-width: 1100px) {
  .app {
    grid-template-columns: 1fr;
  }
}

/* Left: Controls */
.panel {
  background: var(--bgSecondary);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 14px 16px;
  overflow: auto;
}
.title {
  font-weight: 800;
  color: var(--textPrimary);
  font-size: 18px;
  margin: 0 0 4px;
}
.sub {
  color: var(--muted);
  font-size: 12px;
  margin: 0 0 12px;
}
.tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 6px 0 10px;
}
.tab {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--bgAlt);
  color: var(--text);
  cursor: pointer;
  font-weight: 600;
}
.tab.active {
  background: var(--brand);
  border-color: transparent;
  color: #0b0212;
}
.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 8px 0;
  flex-wrap: wrap;
}
.toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
}
.toggle input {
  transform: translateY(1px);
}
.btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
button {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--bgAlt);
  color: var(--text);
  cursor: pointer;
}
button.primary {
  background: var(--brand);
  border-color: transparent;
  color: #0a0312;
  font-weight: 800;
}
button.ghost {
  background: transparent;
}
.section {
  margin: 12px 0 16px;
}
.section h2 {
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 8px;
}
.fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 8px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 8px;
}
.left {
  display: flex;
  flex-direction: column;
}
.left label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.hint {
  font-size: 11px;
  color: var(--muted);
}
input[type="text"],
select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--input);
  color: var(--text);
}
input[type="color"] {
  width: 100%;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  padding: 0;
}
textarea {
  width: 100%;
  min-height: 220px;
  background: #0b0b0d;
  color: #d5d6db;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px;
  font:
    12px/1.45 ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
}

/* Right: Preview (Phone) */
.previewWrap {
  background: var(--bgPrimary);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}
.phone {
  width: 392px;
  max-width: 100%;
  height: calc(100vh - 32px);
  background: var(--bgSecondary);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
}
.status {
  height: 18px;
  background: var(--bgSecondary);
}
.frame {
  position: relative;
  flex: 1;
  overflow: hidden;
}
.view {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 64px 1fr;
  opacity: 0;
  transform: translateX(24px);
  pointer-events: none;
}
.view.active {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
.views.anim .view {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

/* Server rail */
.rail {
  background: var(--bgTertiary);
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.server {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}
.server:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  background: var(--brandHover);
}

/* Top bar */
.chatTopbar,
.topbar {
  grid-column: 2/3;
  background: var(--bgFloating);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.chatChan,
.titlebar {
  font-weight: 800;
  color: var(--textPrimary);
}
.chatChan:hover {
  color: var(--brandHover);
}
.chatActions,
.icons {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.iconBtn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--bgAlt);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    background 0.2s,
    border-color 0.2s;
}
.iconBtn:hover {
  background: var(--brandHover);
  border-color: transparent;
}
.icon {
  width: 16px;
  height: 16px;
  fill: var(--icon);
}
.iconBtn:hover .icon {
  fill: #ffffff;
}

/* Scroll container */
.scroll {
  grid-column: 2/3;
  overflow: auto;
  background: var(--bgPrimary);
  padding: 10px;
}

/* Common row card */
.row {
  display: flex;
  gap: 10px;
  align-items: center;
  background: var(--bgAlt);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 8px 10px;
  margin: 8px 0;
  transition:
    background 0.2s,
    border-color 0.2s;
}
.row:hover {
  background: color-mix(in srgb, #ffffff 6%, var(--bgAlt));
  border-color: color-mix(in srgb, #ffffff 14%, transparent);
}
.name {
  font-weight: 700;
  color: var(--textPrimary);
}
.subtxt {
  color: var(--muted);
  font-size: 12px;
}
.ava {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(
    160deg,
    var(--bgAlt),
    var(--bgSecondary)
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.pill {
  margin-left: auto;
  background: var(--bgAlt);
  color: var(--muted);
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
}

/* ---------- CHAT: realistic Discord mobile flow ---------- */
.chatArea {
  grid-column: 2/3;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
}
.chatScroll {
  overflow: auto;
  background: var(--bgPrimary);
  padding: 12px 10px;
}
.msgGroup {
  display: grid;
  grid-template-columns: 42px 1fr;
  column-gap: 10px;
  margin: 14px 0;
}
.msgAvatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(
    160deg,
    var(--bgAlt),
    var(--bgSecondary)
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.msgBlock {
  min-width: 0;
}
.msgHeader {
  display: flex;
  gap: 8px;
  align-items: baseline;
}
.msgName {
  font-weight: 700;
  color: var(--textPrimary);
}
.msgTime {
  font-size: 11px;
  color: var(--muted);
}
.msgLine {
  margin-top: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  color: var(--text);
  transition: background 0.15s;
}
.msgLine:hover {
  background: color-mix(
    in srgb,
    var(--brandHover) 12%,
    transparent
  );
}
.msgLine .link {
  color: var(--link);
  text-decoration: underline;
}
.msgLine .link:hover {
  color: var(--brandHover);
}
.msgLine .mention {
  background: rgba(114, 0, 0, 0.1);
  color: var(--brand);
  padding: 1px 6px;
  border-radius: 6px;
  box-shadow: inset 3px 0 0 var(--mentionLine);
  transition:
    background 0.15s,
    box-shadow 0.15s,
    color 0.15s;
}
.msgLine .mention:hover {
  background: rgba(170, 0, 0, 0.12);
  box-shadow: inset 3px 0 0 var(--brandHover);
  color: var(--brandHover);
}
.msgGroup.follow .msgAvatar {
  visibility: hidden;
}
.msgGroup.follow .msgHeader {
  display: none;
}

/* embed */
.embed {
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: var(--bgFloating);
  display: grid;
  grid-template-columns: 6px 1fr;
}
.embed .accent {
  background: var(--brand);
}
.embed .body {
  padding: 10px;
}
.embed .title {
  font-weight: 800;
  color: var(--textPrimary);
  margin-bottom: 4px;
}
.embed .desc {
  color: var(--text);
  opacity: 0.9;
}

/* input bar */
.inputbar {
  background: var(--input);
  padding: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  gap: 8px;
  align-items: center;
}
.inputIcon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--bgAlt);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}
.inputIcon:hover {
  background: var(--brandHover);
  border-color: transparent;
}
.inputbar input {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: var(--bgAlt);
  color: var(--text);
}
.send {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: var(--brand);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  border: 0;
  transition: background 0.2s;
}
.send:hover {
  background: var(--brandHover);
}

/* bottom nav */
.nav {
  height: 54px;
  background: var(--bgSecondary);
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.navBtn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
}
.navBtn .icon {
  fill: var(--iconMuted);
}
.navBtn.active {
  color: var(--brand);
}
.navBtn.active .icon {
  fill: var(--brand);
}
.navBtn:hover {
  background: color-mix(
    in srgb,
    var(--brandHover) 12%,
    var(--bgSecondary)
  );
  color: var(--brandHover);
}
.navBtn:hover .icon {
  fill: var(--brandHover);
}

/* Channels specifics */
.chanRow .hash {
  width: 22px;
  text-align: center;
  color: var(--muted);
}
.chanRow .name {
  font-weight: 700;
}

/* Users specifics (Themes+ demo) */
.themesplus-bar {
  background: var(--bgAlt);
}
.ava-overlay {
  position: relative;
}
.ava-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.06),
    rgba(0, 0, 0, 0.18)
  );
  pointer-events: none;
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: var(--bgFloating);
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.toast.show {
  opacity: 1;
}

/* Hover mode highlighter (optional) */
.hovering .row:hover {
  outline: 2px solid rgba(255, 255, 255, 0.12);
}
.hovering .inputbar:hover {
  outline: 2px solid rgba(255, 255, 255, 0.12);
}
</style>
</head>
<body>
<div class="app">
  <!-- Controls -->
  <div class="panel">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <a href="/"><button>Go Back</button></a>
    </div>
    <div class="title">Theme Studio — Mobile <span style="font-weight: 400; font-size: 14px;">by <a href="https://github.com/FizzvrDev" target="_blank" rel="noopener noreferrer" style="color: var(--brand); text-decoration: none;">Fizzdev</a></span></div>
    <div class="sub">
      View-based editor: only shows controls used by the active
      preview.
    </div>

    <div class="tabs" id="tabs">
      <div class="tab active" data-view="chat">Chat</div>
      <div class="tab" data-view="users">Users</div>
      <div class="tab" data-view="channels">Channels</div>
      <div class="tab" data-view="settings">Settings</div>
    </div>

    <div class="toolbar">
      <label class="toggle"
        ><input type="checkbox" id="hoverMode" /> Hover
        mode</label
      >
      <label class="toggle"
        ><input type="checkbox" id="showAll" /> Show all
        controls</label
      >
      <button id="presetPurple" class="primary">
        Purple Vision
      </button>
      <button id="presetBlue">Cobalt Vision</button>
      <button id="presetDefault" class="ghost">
        Default Dark
      </button>
    </div>

    <div id="controls"></div>

    <div class="section">
      <h2>Import / Export</h2>
      <div class="btns">
        <button id="import" class="ghost">Import JSON</button>
        <button id="copy" class="primary">Copy JSON</button>
        <button id="download">Download JSON</button>
        <button id="open" class="ghost">Open JSON</button>
      </div>
      <textarea id="jsonOut" readonly></textarea>
      <div class="sub">
        Host on GitHub and use the
        <b>raw.githubusercontent.com</b> link in Themes+. Bump
        <code>"version"</code> then Refetch.
      </div>
    </div>
  </div>

  <!-- Preview -->
  <div class="previewWrap">
    <div class="phone">
      <div class="status"></div>
      <div class="frame">
        <div class="views anim">
          <!-- CHAT -->
          <div class="view active" data-view="chat">
            <!-- Left rail -->
            <div class="rail">
              <div class="server" title="Server A">A</div>
              <div class="server" title="Add">+</div>
              <div class="server" title="Server B">B</div>
            </div>

            <!-- Chat column -->
            <div class="chatArea">
              <!-- topbar -->
              <div class="chatTopbar">
                <div class="chatChan"># general</div>
                <div class="chatActions">
                  <div class="iconBtn" title="Search">
                    <svg
                      class="icon"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 001.48-4.23C15.91 6.01 13.4 3.5 10.45 3.5S5 6.01 5 9s2.51 5.5 5.45 5.5c1.61 0 3.09-.59 4.23-1.48l.27.28v.79L20 20.49 21.49 19 15.5 14zM10.45 13C8.3 13 6.59 11.29 6.59 9.14S8.3 5.27 10.45 5.27s3.86 1.71 3.86 3.86S12.6 13 10.45 13z"
                      />
                    </svg>
                  </div>
                  <div
                    class="iconBtn"
                    title="Members"
                  >
                    <svg
                      class="icon"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.92 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                      />
                    </svg>
                  </div>
                  <div class="iconBtn" title="More">
                    <svg
                      class="icon"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- messages -->
              <div class="chatScroll">
                <!-- DemoUser -->
                <div class="msgGroup">
                  <div class="msgAvatar"></div>
                  <div class="msgBlock">
                    <div class="msgHeader">
                      <span class="msgName"
                        >DemoUser</span
                      >
                      <span class="msgTime"
                        >Today at 12:31</span
                      >
                    </div>
                    <div class="msgLine">
                      Hey, this is the first
                      message!
                    </div>
                    <div class="msgLine">
                      Here's another line right
                      after it.
                    </div>
                  </div>
                </div>

                <!-- AnotherUser -->
                <div class="msgGroup">
                  <div class="msgAvatar"></div>
                  <div class="msgBlock">
                    <div class="msgHeader">
                      <span class="msgName"
                        >AnotherUser</span
                      >
                      <span class="msgTime"
                        >Today at 12:32</span
                      >
                    </div>
                    <div class="msgLine">
                      Hello there
                      <span class="mention"
                        >@DemoUser</span
                      >, check this out:
                    </div>
                    <div class="msgLine">
                      <a
                        class="link"
                        href="https://discord.gg/example"
                        target="_blank"
                        rel="noreferrer"
                        >https://discord.gg/example</a
                      >
                    </div>
                  </div>
                </div>

                <!-- AnotherUser follow-up -->
                <div class="msgGroup follow">
                  <div class="msgAvatar"></div>
                  <div class="msgBlock">
                    <div class="msgLine">
                      One more line to show
                      stacked messages.
                    </div>
                  </div>
                </div>

                <!-- BotUser + Embed -->
                <div class="msgGroup">
                  <div class="msgAvatar"></div>
                  <div class="msgBlock">
                    <div class="msgHeader">
                      <span class="msgName"
                        >BotUser</span
                      >
                      <span class="msgTime"
                        >Today at 12:33</span
                      >
                    </div>
                    <div class="msgLine">
                      Here's an embed preview:
                    </div>
                    <div class="embed">
                      <div class="accent"></div>
                      <div class="body">
                        <div class="title">
                          Example Embed
                        </div>
                        <div class="desc">
                          This embed adopts
                          your theme's
                          background + brand
                          color.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- input -->
              <div class="inputbar">
                <div class="inputIcon" title="Attach">
                  <svg
                    class="icon"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17.5 6.5l-7.09 7.09a2.5 2.5 0 01-3.54-3.54l7.79-7.79a4.5 4.5 0 116.36 6.36l-8.49 8.49a6.5 6.5 0 11-9.19-9.19l7.79-7.79"
                    />
                  </svg>
                </div>
                <input placeholder="Message #general" />
                <div class="inputIcon" title="Emoji">
                  <svg
                    class="icon"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm-3 7a1.5 1.5 0 11-1.5 1.5A1.5 1.5 0 019 9zm9 3a6 6 0 11-6-6 6 6 0 016 6zm-3 3a4 4 0 01-8 0z"
                    />
                  </svg>
                </div>
                <button class="send" title="Send">
                  <svg
                    class="icon"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M2 21l21-9L2 3v7l15 2-15 2z"
                    />
                  </svg>
                </button>
              </div>

              <!-- bottom nav -->
              <div class="nav">
                <div class="navBtn active">
                  <svg
                    class="icon"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 3l9 8h-3v9H6v-9H3z"
                    /></svg
                  >Home
                </div>
                <div class="navBtn">
                  <svg
                    class="icon"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zM16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.92 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                    /></svg
                  >Friends
                </div>
                <div class="navBtn">
                  <svg
                    class="icon"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8a4 4 0 104 4 4 4 0 00-4-4zm0-6a2 2 0 012 2v2a2 2 0 01-4 0V4a2 2 0 012-2zM4 12a2 2 0 012-2h2a2 2 0 010 4H6a2 2 0 01-2-2zm12 6a2 2 0 012-2h2a2 2 0 010 4h-2a2 2 0 01-2-2zM4 20a2 2 0 012-2h2a2 2 0 010 4H6a2 2 0 01-2-2z"
                    /></svg
                  >Activity
                </div>
                <div class="navBtn">
                  <svg
                    class="icon"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19.14 12.94a7 7 0 00.06-1l2.11-1.65a.5.5 0 00.12-.64l-2-3.46a.5.5 0 00-.6-.22l-2.49 1a7.14 7.14 0 00-1.73-1l-.38-2.65A.5.5 0 0013.7 2h-3.4a.5.5 0 00-.5.43l-.38 2.65a7.14 7.14 0 00-1.73 1l-2.49-1a.5.5 0 00-.6.22l-2 3.46a.5.5 0 00.12.64L4.8 11a7 7 0 000 2l-2.11 1.65a.5.5 0 00-.12.64l2 3.46a.5.5 0 00.6.22l2.49-1a7.14 7.14 0 001.73 1l.38 2.65a.5.5 0 00.5.43h3.4a.5.5 0 00.5-.43l.38-2.65a7.14 7.14 0 001.73-1l2.49 1a.5.5 0 00.6-.22l2-3.46a.5.5 0 00-.12-.64zM12 15.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z"
                    /></svg
                  >Settings
                </div>
              </div>
            </div>
          </div>

          <!-- USERS -->
          <div class="view" data-view="users">
            <div class="rail">
              <div class="server">A</div>
              <div class="server">+</div>
              <div class="server">B</div>
            </div>
            <div class="scroll">
              <div class="topbar">
                <div class="titlebar">Members</div>
                <div class="icons">
                  <div class="iconBtn">
                    <svg
                      class="icon"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 8a4 4 0 104 4 4 4 0 00-4-4z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Themes+ info row -->
              <div class="row themesplus-bar">
                <div class="ava ava-overlay"></div>
                <div>
                  <div class="name">
                    Icon Pack:
                    <span id="packName"
                      >rosiecord-plumpy</span
                    >
                  </div>
                  <div class="subtxt">
                    Overlays:
                    <span id="overlayState"
                      >enabled</span
                    >
                    • Mention →
                    <span class="mention"
                      >@you</span
                    >
                  </div>
                </div>
                <button
                  class="pill"
                  id="showToastBtn"
                  type="button"
                >
                  Toast
                </button>
              </div>

              <div class="row">
                <div class="ava"></div>
                <div>
                  <div class="name">Member One</div>
                  <div class="subtxt">
                    Online • @Role
                  </div>
                </div>
                <div class="pill">MOD</div>
              </div>
              <div class="row">
                <div class="ava"></div>
                <div>
                  <div class="name">Member Two</div>
                  <div class="subtxt">
                    Idle • @Role
                  </div>
                </div>
                <div class="pill">VIP</div>
              </div>
              <div class="row">
                <div class="ava"></div>
                <div>
                  <div class="name">Member Three</div>
                  <div class="subtxt">
                    Offline • @Role
                  </div>
                </div>
                <div class="pill">GUEST</div>
              </div>
            </div>
          </div>

          <!-- CHANNELS -->
          <div class="view" data-view="channels">
            <div class="rail">
              <div class="server">A</div>
              <div class="server">+</div>
              <div class="server">B</div>
            </div>
            <div class="scroll">
              <div class="topbar">
                <div class="titlebar">Channels</div>
                <div class="icons">
                  <div class="iconBtn">
                    <svg
                      class="icon"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 3H9v4H5v6h4v4h6v-4h4V7h-4z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div class="row chanRow">
                <div class="hash">#</div>
                <div>
                  <div class="name">general</div>
                  <div class="subtxt">
                    Category • Server
                  </div>
                </div>
                <div class="pill">NEW</div>
              </div>
              <div class="row chanRow">
                <div class="hash">#</div>
                <div>
                  <div class="name">random</div>
                  <div class="subtxt">
                    Category • Server
                  </div>
                </div>
                <div class="pill">5</div>
              </div>
              <div class="row chanRow">
                <div class="hash">#</div>
                <div>
                  <div class="name">media</div>
                  <div class="subtxt">
                    Category • Server
                  </div>
                </div>
                <div class="pill">•</div>
              </div>
            </div>
          </div>

          <!-- SETTINGS -->
          <div class="view" data-view="settings">
            <div class="rail">
              <div class="server">A</div>
              <div class="server">+</div>
              <div class="server">B</div>
            </div>
            <div class="scroll">
              <div class="topbar">
                <div class="titlebar">Settings</div>
                <div class="icons">
                  <div class="iconBtn">
                    <svg
                      class="icon"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19.14 12.94a7 7 0 00.06-1l2.11-1.65a.5.5 0 00.12-.64l-2-3.46a.5.5 0 00-.6-.22l-2.49 1a7.14 7.14 0 00-1.73-1l-.38-2.65A.5.5 0 0013.7 2h-3.4a.5.5 0 00-.5.43l-.38 2.65a7.14 7.14 0 00-1.73 1l-2.49-1a.5.5 0 00-.6.22l-2 3.46a.5.5 0 00.12.64L4.8 11a7 7 0 000 2l-2.11 1.65a.5.5 0 00-.12.64l2 3.46a.5.5 0 00.6.22l2.49-1a7.14 7.14 0 001.73 1l.38 2.65a.5.5 0 00.5.43h3.4a.5.5 0 00.5-.43l.38-2.65a7.14 7.14 0 001.73-1l2.49 1a.5.5 0 00.6-.22l2-3.46a.5.5 0 00-.12-.64zM12 15.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="ava"></div>
                <div>
                  <div class="name">Cards</div>
                  <div class="subtxt">
                    Floating, borders
                  </div>
                </div>
                <div class="pill">UI</div>
              </div>
              <div class="row">
                <div class="ava"></div>
                <div>
                  <div class="name">Buttons</div>
                  <div class="subtxt">
                    Brand, hover
                  </div>
                </div>
                <div class="pill">OK</div>
              </div>
              <div class="row">
                <div class="ava"></div>
                <div>
                  <div class="name">Scrollbars</div>
                  <div class="subtxt">
                    Thin / auto thumb
                  </div>
                </div>
                <div class="pill">FX</div>
              </div>
            </div>
          </div>
        </div>
        <!-- /views -->
      </div>
    </div>
  </div>
</div>

<script>
/* ============== Presets ============== */
const PRESETS = {
  purple: {
    meta: {
      name: "Purple Vision (Alpha Mobile)",
      desc: "Crisp purple accents on a deep dark UI.",
      version: "3",
      author: { name: "Your Name", id: "000000000000000000" },
    },
    palette: {
      brand: "#8200c8",
      brandHover: "#3d007a",
      link: "#8200c8",
      text: "#cbadff",
      muted: "#d359ff",
      textPrimary: "#e9d9ff",
      textSecond: "#d79dff",
      bgPrimary: "#0f0f10",
      bgSecondary: "#121214",
      bgAlt: "#101012",
      bgTertiary: "#0c0c0e",
      bgFloating: "#0f0f12",
      bgNested: "#0e0e10",
      cardPrimary: "#0e0e10",
      cardSecondary: "#0f0f12",
      input: "#121214",
      success: "#43b581",
      warning: "#faa61a",
      danger: "#7f007b",
      ripple: "#5b2a82",
      scrollbar: "#2b2b2b",
      mentionLine: "#b592e6",
    },
    plus: {
      iconPack: "rosiecord-plumpy",
      customOverlays: true,
    },
  },
  cobalt: {
    meta: {
      name: "Cobalt Vision (Alpha Mobile)",
      desc: "Azure/cobalt accents, dark everything.",
      version: "3",
      author: { name: "Your Name", id: "000000000000000000" },
    },
    palette: {
      brand: "#2ea8ff",
      brandHover: "#166dce",
      link: "#2ea8ff",
      text: "#d6e8ff",
      muted: "#a8c6ff",
      textPrimary: "#e7f1ff",
      textSecond: "#b9d4ff",
      bgPrimary: "#0f0f10",
      bgSecondary: "#121214",
      bgAlt: "#101012",
      bgTertiary: "#0c0c0e",
      bgFloating: "#0f0f12",
      bgNested: "#0e0e10",
      cardPrimary: "#0e0e10",
      cardSecondary: "#0f0f12",
      input: "#121214",
      success: "#43b581",
      warning: "#f5b14d",
      danger: "#e04f5f",
      ripple: "#2a5d9c",
      scrollbar: "#2b2b2b",
      mentionLine: "#8ecbff",
    },
    plus: {
      iconPack: "rosiecord-plumpy",
      customOverlays: true,
    },
  },
  default: {
    meta: {
      name: "Default Dark",
      desc: "Safe starter preset.",
      version: "1",
      author: { name: "Your Name", id: "000000000000000000" },
    },
    palette: {
      brand: "#5865f2",
      brandHover: "#4450d8",
      link: "#5865f2",
      text: "#e6e6e6",
      muted: "#aaaaaa",
      textPrimary: "#ffffff",
      textSecond: "#cfcfcf",
      bgPrimary: "#2b2d31",
      bgSecondary: "#232428",
      bgAlt: "#1e1f22",
      bgTertiary: "#1a1b1e",
      bgFloating: "#2b2d31",
      bgNested: "#1e1f22",
      cardPrimary: "#1e1f22",
      cardSecondary: "#2b2d31",
      input: "#1e1f22",
      success: "#3ba55d",
      warning: "#faa61a",
      danger: "#ed4245",
      ripple: "#3a3d43",
      scrollbar: "#3a3d43",
      mentionLine: "#7aa0ff",
    },
    plus: { iconPack: "default", customOverlays: false },
  },
};

/* ============== Field sets by view (context-aware) ============== */
const FIELDS = {
  meta: [
    { id: "name", label: "Name", type: "text", group: "Meta" },
    {
      id: "desc",
      label: "Description",
      type: "text",
      group: "Meta",
    },
    {
      id: "ver",
      label: "Version",
      type: "text",
      group: "Meta",
    },
    {
      id: "authN",
      label: "Author Name",
      type: "text",
      group: "Meta",
    },
    {
      id: "authI",
      label: "Author ID",
      type: "text",
      group: "Meta",
    },
  ],
  plus: [
    {
      id: "iconPack",
      label: "Themes+ Icon Pack",
      type: "select",
      options: [
        "rosiecord-plumpy",
        "oneko-plumpy",
        "default",
      ],
      group: "Themes+",
    },
    {
      id: "mentionLineColor",
      label: "Mention Line",
      type: "color",
      group: "Themes+",
    },
    {
      id: "customOverlays",
      label: "Custom Overlays",
      type: "checkbox",
      group: "Themes+",
    },
  ],
  chat: [
    {
      id: "brand",
      label: "Brand",
      type: "color",
      hint: "Buttons, accents",
    },
    { id: "brandHover", label: "Brand (hover)", type: "color" },
    { id: "link", label: "Link", type: "color" },
    { id: "text", label: "Text (normal)", type: "color" },
    { id: "muted", label: "Text (muted)", type: "color" },
    {
      id: "textPrimary",
      label: "Text (primary)",
      type: "color",
    },
    {
      id: "textSecond",
      label: "Text (secondary)",
      type: "color",
    },
    {
      id: "bgPrimary",
      label: "Chat background",
      type: "color",
    },
    { id: "bgFloating", label: "Header", type: "color" },
    {
      id: "cardPrimary",
      label: "Message bubble",
      type: "color",
    },
    { id: "input", label: "Input background", type: "color" },
    { id: "bgAlt", label: "Active row/card", type: "color" },
    {
      id: "mentionLineColor",
      label: "Mention line",
      type: "color",
    },
  ],
  users: [
    { id: "textPrimary", label: "Name text", type: "color" },
    { id: "muted", label: "Role / status text", type: "color" },
    {
      id: "bgPrimary",
      label: "List background",
      type: "color",
    },
    { id: "bgAlt", label: "Member card", type: "color" },
    { id: "bgFloating", label: "Header", type: "color" },
    { id: "brand", label: "Badges / accents", type: "color" },
  ],
  channels: [
    { id: "textSecond", label: "Channel text", type: "color" },
    { id: "muted", label: "Category / meta", type: "color" },
    {
      id: "bgPrimary",
      label: "List background",
      type: "color",
    },
    { id: "bgAlt", label: "Channel row", type: "color" },
    { id: "bgFloating", label: "Header", type: "color" },
    { id: "brand", label: "Selected / accent", type: "color" },
  ],
  settings: [
    {
      id: "cardSecondary",
      label: "Card secondary",
      type: "color",
    },
    { id: "bgAlt", label: "Card base", type: "color" },
    { id: "bgSecondary", label: "Panel/nav", type: "color" },
    {
      id: "scrollbar",
      label: "Scrollbar thumb",
      type: "color",
    },
    { id: "success", label: "Success", type: "color" },
    { id: "warning", label: "Warning", type: "color" },
    { id: "danger", label: "Danger", type: "color" },
    { id: "ripple", label: "Android ripple", type: "color" },
  ],
};

/* ============== DOM helpers & state ============== */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) =>
  Array.from(root.querySelectorAll(s));
const root = document.documentElement;
const setVar = (k, v) => root.style.setProperty("--" + k, v);
const A = (v) => [v];

let activeView = "chat";
let showAll = false;
let state = JSON.parse(JSON.stringify(PRESETS.purple)); // deep clone

/* ============== Controls rendering ============== */
const controls = document.getElementById("controls");

function fieldHTML(f) {
  const right =
    f.type === "select"
      ? \`<select id="\${f.id}">\${(f.options || []).map((o) => \`<option value="\${o}">\${o}</option>\`).join("")}</select>\`
      : f.type === "checkbox"
        ? \`<label style="display:flex;gap:8px;align-items:center"><input id="\${f.id}" type="checkbox"> enabled</label>\`
        : \`<input id="\${f.id}" type="\${f.type}" \${f.type === "color" ? 'value="#000000"' : ""}>\`;
  return \`
<div class="field" data-key="\${f.id}">
  <div class="left">
    <label for="\${f.id}">\${f.label}</label>
    \${f.hint ? \`<div class="hint">\${f.hint}</div>\` : ""}
  </div>
  \${right}
</div>\`;
}

function groupHTML(title, items) {
  return \`<div class="section"><h2>\${title}</h2><div class="fields">\${items.map(fieldHTML).join("")}</div></div>\`;
}

function renderControls() {
  const blocks = [];
  if (showAll || activeView === "chat")
    blocks.push(groupHTML("Meta", FIELDS.meta));
  blocks.push(groupHTML("Colors", FIELDS[activeView] || []));
  if (activeView === "users" || showAll)
    blocks.push(groupHTML("Themes+ Options", FIELDS.plus));
  controls.innerHTML = blocks.join("");
  wireInputs();
  populateFromState();
}

/* ============== Apply/populate ============== */
function applyPalette(p) {
  Object.entries(p).forEach(([k, v]) => {
    setVar(k, v);
    const el = document.getElementById(k);
    if (el) {
      if (el.type === "color" || el.type === "text")
        el.value = v;
      if (el.tagName === "SELECT") el.value = v;
    }
  });
  const ml = document.getElementById("mentionLineColor");
  if (ml) ml.value = p.mentionLine || "#8ecbff";
  // defensive defaults for icon tints
  root.style.setProperty("--icon", p.text || "#e6e6e6");
  root.style.setProperty("--iconMuted", "#8a8a8a");
}

function updateThemesPlusIndicators() {
  const pack = state.plus?.iconPack || "default";
  const overlays = !!state.plus?.customOverlays;
  const nameEl = document.getElementById("packName");
  const ovEl = document.getElementById("overlayState");
  if (nameEl) nameEl.textContent = pack;
  if (ovEl) ovEl.textContent = overlays ? "enabled" : "disabled";
}

function populateFromState() {
  const m = state.meta;
  const setV = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };
  setV("name", m.name);
  setV("desc", m.desc);
  setV("ver", m.version);
  setV("authN", m.author?.name || "");
  setV("authI", m.author?.id || "");
  // plus
  const ip = document.getElementById("iconPack");
  if (ip) ip.value = state.plus?.iconPack || "default";
  const co = document.getElementById("customOverlays");
  if (co) co.checked = !!state.plus?.customOverlays;
  const ml = document.getElementById("mentionLineColor");
  if (ml) ml.value = state.palette.mentionLine || "#8ecbff";
  // palette
  applyPalette(state.palette);
  updateThemesPlusIndicators();
  buildJSON();
}

function setPreset(key) {
  state = JSON.parse(JSON.stringify(PRESETS[key]));
  applyPalette(state.palette);
  renderControls();
  buildJSON();
}

/* ============== Inputs ============== */
function wireInputs() {
  // meta
  ["name", "desc", "ver", "authN", "authI"].forEach((id) => {
    const el = document.getElementById(id);
    if (el)
      el.oninput = () => {
        if (id === "name") state.meta.name = el.value;
        else if (id === "desc") state.meta.desc = el.value;
        else if (id === "ver")
          state.meta.version = el.value;
        else if (id === "authN")
          state.meta.author.name = el.value;
        else if (id === "authI")
          state.meta.author.id = el.value;
        buildJSON();
      };
  });
  // plus
  const ip = document.getElementById("iconPack");
  if (ip)
    ip.oninput = () => {
      state.plus.iconPack = ip.value;
      updateThemesPlusIndicators();
      buildJSON();
    };
  const co = document.getElementById("customOverlays");
  if (co)
    co.oninput = () => {
      state.plus.customOverlays = co.checked;
      updateThemesPlusIndicators();
      buildJSON();
    };
  const ml = document.getElementById("mentionLineColor");
  if (ml)
    ml.oninput = () => {
      state.palette.mentionLine = ml.value;
      setVar("mentionLine", ml.value);
      buildJSON();
    };
  // colors
  const ids = [
    "brand",
    "brandHover",
    "link",
    "text",
    "muted",
    "textPrimary",
    "textSecond",
    "bgPrimary",
    "bgSecondary",
    "bgAlt",
    "bgTertiary",
    "bgFloating",
    "bgNested",
    "cardPrimary",
    "cardSecondary",
    "input",
    "success",
    "warning",
    "danger",
    "ripple",
    "scrollbar",
  ];
  ids.forEach((k) => {
    const el = document.getElementById(k);
    if (!el) return;
    el.oninput = () => {
      state.palette[k] = el.value;
      setVar(k, el.value);
      if (k === "brand" && document.getElementById("link")) {
        state.palette.link = el.value;
        setVar("link", el.value);
        const ln = document.getElementById("link");
        if (ln) ln.value = el.value;
      }
      buildJSON();
    };
  });
}

/* ============== JSON Builder (spec:2 + plus) ============== */
function buildJSON() {
  const P = state.palette,
    meta = state.meta,
    plus = state.plus || {};
  const authors = [
    { name: meta.author.name, id: meta.author.id },
  ].filter((a) => a.name && a.id);

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
    CHANNELS_DEFAULT: A(P.muted),
    CHANNEL_ICON: A(P.muted),
    CHANNELTEXTAREA_BACKGROUND: A(P.input),

    EMBED_BACKGROUND: A(P.bgFloating),

    HEADER_PRIMARY: A(P.text),
    HEADER_SECONDARY: A(P.muted),

    INTERACTIVE_ACTIVE: A(P.brand),
    INTERACTIVE_HOVER: A(P.brandHover),
    INTERACTIVE_MUTED: A(P.muted),
    INTERACTIVE_NORMAL: A(P.text),

    MENTION_BACKGROUND: A("rgba(114,0,0,0.1)"),
    MENTION_FOREGROUND: A(P.brand),

    REDESIGN_ACTIVITY_CARD_BACKGROUND: A(P.bgAlt),
    REDESIGN_ACTIVITY_CARD_BACKGROUND_PRESSED: A(P.bgSecondary),
    REDESIGN_BUTTON_SECONDARY_ALT_BACKGROUND: A(P.bgAlt),
    REDESIGN_BUTTON_SECONDARY_BACKGROUND: A(P.bgAlt),
    REDESIGN_BUTTON_SECONDARY_BORDER: A("#FFFFFF1A"),
    REDESIGN_BUTTON_DANGER_BACKGROUND: A(P.danger),
    REDESIGN_CHANNEL_CATEGORY_NAME_TEXT: A(P.muted),
    REDESIGN_CHANNEL_NAME_TEXT: A(P.text),
    REDESIGN_CHAT_INPUT_BACKGROUND: A(P.input),

    SPOILER_HIDDEN_BACKGROUND: A("#000000"),

    STATUS_DANGER: A(P.danger),
    STATUS_DANGER_BACKGROUND: A(P.danger),
    STATUS_DANGER_TEXT: A(P.bgPrimary),

    POLLS_NORMAL_FILL_HOVER: A(P.bgSecondary),
    POLLS_NORMAL_IMAGE_BACKGROUND: A(P.bgSecondary),
    POLLS_VICTOR_FILL: A(P.success + "80"),

    TEXT_LINK: A(P.link),
    TEXT_MUTED: A(P.muted),
    TEXT_NORMAL: A(P.text),
    TEXT_PRIMARY: A(P.textPrimary),
    TEXT_SECONDARY: A(P.textSecond),

    BG_MOD_FAINT: A("#FFFFFF12"),
    KEYBOARD: A(P.bgAlt),
    BACKGROUND_MODIFIER_ACCEPT: A(P.success + "33"),
    BACKGROUND_MODIFIER_ACCEPT_HOVER: A(P.success + "4d"),
    AUTOMOD_QUEUED_FOR_REVIEW_BACKGROUND: A(P.warning + "33"),
    AUTOMOD_QUEUED_FOR_REVIEW_BACKGROUND_HOVER: A(
      P.warning + "4d",
    ),

    SCROLLBAR_AUTO_THUMB: A(P.scrollbar),
    SCROLLBAR_AUTO_TRACK: A("transparent"),
    SCROLLBAR_THIN_THUMB: A(P.scrollbar),
    SCROLLBAR_THIN_TRACK: A("transparent"),
  };

  const rawColors = {
    BLUE_260: "#5a76a8",
    BLUE_300: "#5a76a8",
    BLUE_330: "#5a76a8",
    BLUE_345: "#5a76a8",
    BLUE_360: "#5a76a8",
    BLUE_400: "#5a76a8",
    BLUE_430: "#5a76a8",
    BLUE_460: "#5a76a8",
    BLUE_500: "#5a76a8",
    BLUE_530: "#5a76a8",
    BLUE_560: "#5a76a8",
    BLUE_600: "#5a76a8",
    BLUE_630: "#5a76a8",
    BLUE_660: "#5a76a8",
    BLUE_700: "#5a76a8",
    BLACK_500: "#000000b2",

    BRAND_200: P.brand,
    BRAND_260: P.brand,
    BRAND_300: P.brand,
    BRAND_330: P.brand,
    BRAND_345: P.brand,
    BRAND_360: P.brand,
    BRAND_400: P.brand,
    BRAND_430: P.brand,
    BRAND_460: P.brand,
    BRAND_500: P.brand,
    BRAND_530: P.brand,
    BRAND_560: P.brandHover,
    BRAND_600: P.brand,
    BRAND_630: P.brand,
    BRAND_660: P.brand,
    BRAND_700: P.brand,
    BRAND_730: P.text,

    PLUM_1: P.text,
    PLUM_3: P.brand,
    PLUM_4: P.text,
    PLUM_6: P.text,
    PLUM_9: P.muted,
    PLUM_10: P.muted,
    PLUM_11: P.muted,
    PLUM_13: P.muted,
    PLUM_15: P.brand,
    PLUM_16: P.bgSecondary,
    PLUM_17: P.bgPrimary,
    PLUM_18: P.bgAlt,
    PLUM_19: P.bgSecondary,
    PLUM_20: P.bgPrimary,
    PLUM_21: P.bgSecondary,
    PLUM_22: P.bgSecondary,
    PLUM_24: P.bgPrimary,
    PLUM_25: P.bgPrimary,

    PRIMARY_100: P.muted,
    PRIMARY_200: P.text,
    PRIMARY_300: P.brand,
    PRIMARY_330: P.text,
    PRIMARY_360: P.brand,
    PRIMARY_400: P.brandHover,
    PRIMARY_460: P.bgSecondary,
    PRIMARY_500: P.brand,
    PRIMARY_530: P.brand,
    PRIMARY_600: P.bgPrimary,
    PRIMARY_630: P.bgSecondary,
    PRIMARY_645: P.bgAlt,
    PRIMARY_660: P.bgSecondary,
    PRIMARY_700: P.bgTertiary,
    PRIMARY_730: P.muted,
    PRIMARY_800: P.cardSecondary,

    GREEN_260: P.success,
    GREEN_300: P.success,
    GREEN_330: P.success,
    GREEN_345: P.success,
    GREEN_360: P.success,
    GREEN_400: P.success,
    GREEN_430: P.success,
    GREEN_460: P.success,
    GREEN_500: P.success,
    GREEN_530: P.success,
    GREEN_560: P.success,
    GREEN_600: P.success,
    GREEN_630: P.success,
    GREEN_660: P.success,
    GREEN_700: P.success,

    GUILD_BOOSTING_PINK: P.brand,
    GUILD_BOOSTING_PURPLE: P.brand,
    GUILD_BOOSTING_PURPLE_FOR_GRADIENTS: P.brand,

    RED_260: P.danger,
    RED_300: P.danger,
    RED_330: P.danger,
    RED_345: P.danger,
    RED_360: P.danger,
    RED_400: P.danger,
    RED_430: P.danger,
    RED_460: P.danger,
    RED_500: P.danger,
    RED_530: P.danger,
    RED_560: P.danger,
    RED_600: P.danger,
    RED_630: P.danger,
    RED_660: P.danger,
    RED_700: P.danger,

    ORANGE_260: P.warning,
    ORANGE_300: P.warning,
    ORANGE_330: P.warning,
    ORANGE_345: P.warning,
    ORANGE_360: P.warning,
    ORANGE_400: P.warning,
    ORANGE_430: P.warning,
    ORANGE_460: P.warning,
    ORANGE_500: P.warning,
    ORANGE_530: P.warning,
    ORANGE_560: P.warning,
    ORANGE_600: P.warning,
    ORANGE_630: P.warning,
    ORANGE_660: P.warning,
    ORANGE_700: P.warning,

    YELLOW_260: P.warning,
    YELLOW_300: P.warning,
    YELLOW_330: P.warning,
    YELLOW_345: P.warning,
    YELLOW_360: P.warning,
    YELLOW_400: P.warning,
    YELLOW_430: P.warning,
    YELLOW_460: P.warning,
    YELLOW_500: P.warning,
    YELLOW_530: P.warning,
    YELLOW_560: P.warning,
    YELLOW_600: P.warning,
    YELLOW_630: P.warning,
    YELLOW_660: P.warning,
    YELLOW_700: P.warning,

    WHITE_500: P.text,
    WHITE_630: P.muted,
    ROLE_DEFAULT: P.muted,
  };

  const obj = {
    name: meta.name,
    description: meta.desc,
    version: meta.version,
    authors: authors.length
      ? authors
      : [{ name: "Author", id: "000000000000000000" }],
    semanticColors,
    rawColors,
    plus: {
      version: "0",
      iconPack: plus.iconPack || "default",
      mentionLineColor: P.mentionLine,
      customOverlays: !!plus.customOverlays,
    },
    spec: 2,
  };
  document.getElementById("jsonOut").value = JSON.stringify(
    obj,
    null,
    2,
  );
  return obj;
}

/* ============== Tabs / toggles / presets / import-export ============== */
document.getElementById("tabs").addEventListener("click", (e) => {
  const t = e.target.closest(".tab");
  if (!t) return;
  const view = t.dataset.view;
  if (!view) return;
  $$(".tab", tabs).forEach((el) =>
    el.classList.toggle("active", el === t),
  );
  const container = document.querySelector(".views");
  container.classList.add("anim");
  $$(".view").forEach((v) =>
    v.classList.toggle("active", v.dataset.view === view),
  );
  activeView = view;
  renderControls();
});

document
  .getElementById("hoverMode")
  .addEventListener("change", (e) => {
    const on = e.target.checked;
    const frame = document.querySelector(".phone .frame");
    frame.classList.toggle("hovering", on);
  });

document
  .getElementById("showAll")
  .addEventListener("change", (e) => {
    showAll = e.target.checked;
    renderControls();
  });

document.getElementById("presetPurple").onclick = () =>
  setPreset("purple");
document.getElementById("presetBlue").onclick = () =>
  setPreset("cobalt");
document.getElementById("presetDefault").onclick = () =>
  setPreset("default");

document.getElementById("import").onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        state.meta.name = data.name || state.meta.name;
        state.meta.desc =
          data.description || state.meta.desc;
        state.meta.version =
          data.version || state.meta.version;
        if (Array.isArray(data.authors) && data.authors[0])
          state.meta.author = {
            name: data.authors[0].name || "",
            id: data.authors[0].id || "",
          };
        state.plus = state.plus || {};
        if (data.plus) {
          if (data.plus.iconPack)
            state.plus.iconPack = data.plus.iconPack;
          if (
            typeof data.plus.customOverlays ===
            "boolean"
          )
            state.plus.customOverlays =
              data.plus.customOverlays;
          if (data.plus.mentionLineColor)
            state.palette.mentionLine =
              data.plus.mentionLineColor;
        }
        // best-effort palette mapping from semanticColors
        const sc = data.semanticColors || {};
        const pick = (k) =>
          Array.isArray(sc[k]) ? sc[k][0] : null;
        const map = {
          brand: "TEXT_LINK",
          text: "TEXT_NORMAL",
          muted: "TEXT_MUTED",
          textPrimary: "TEXT_PRIMARY",
          textSecond: "TEXT_SECONDARY",
          link: "TEXT_LINK",
          bgPrimary: "BACKGROUND_PRIMARY",
          bgSecondary: "BACKGROUND_SECONDARY",
          bgAlt: "BACKGROUND_SECONDARY_ALT",
          bgTertiary: "BACKGROUND_TERTIARY",
          bgFloating: "BACKGROUND_FLOATING",
          bgNested: "BACKGROUND_NESTED_FLOATING",
          cardPrimary: "CARD_PRIMARY_BG",
          cardSecondary: "CARD_SECONDARY_BG",
          input: "CHANNELTEXTAREA_BACKGROUND",
        };
        Object.entries(map).forEach(([k, kk]) => {
          const v = pick(kk);
          if (v) state.palette[k] = v;
        });
        applyPalette(state.palette);
        updateThemesPlusIndicators();
        renderControls();
        buildJSON();
      } catch (err) {
        alert("Invalid JSON");
        console.error(err);
      }
    };
    r.readAsText(f);
  };
  input.click();
};

document.getElementById("copy").onclick = () => {
  navigator.clipboard.writeText(
    document.getElementById("jsonOut").value,
  );
  const btn = document.getElementById("copy");
  const old = btn.textContent;
  btn.textContent = "Copied!";
  setTimeout(() => (btn.textContent = old), 900);
};
document.getElementById("download").onclick = () => {
  const blob = new Blob(
    [document.getElementById("jsonOut").value],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (state.meta.name || "theme") + ".json";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
};
document.getElementById("open").onclick = () => {
  const data =
    "data:application/json;charset=utf-8," +
    encodeURIComponent(
      document.getElementById("jsonOut").value,
    );
  window.open(data, "_blank");
};

/* Users view toast demo */
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "showToastBtn") {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.textContent = "Themes+ toast preview";
      document.body.appendChild(t);
    }
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1200);
  }
});

/* Init */
renderControls();
applyPalette(state.palette);
updateThemesPlusIndicators();
buildJSON();
</script>
</body>
</html>`;

  return new Response(htmlContent, {
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
    },
  });
}
