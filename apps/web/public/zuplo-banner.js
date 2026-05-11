class ZuploBanner extends HTMLElement {
  constructor() {
    super();

    // Attach a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    // JSON data for the tools
    const toolsData = {
      zudoku: {
        name: "Zudoku",
        logo: "https://cdn.zuplo.com/uploads/zudoku-logo-only.svg",
        description: "API documentation should be free.",
        url: "https://zudoku.dev?utm_source=ratemyopenapi&utm_medium=web&utm_campaign=header&ref=ratemyopenapi",
      },
      ratemyopenapi: {
        name: "Rate My OpenAPI",
        logo: "https://cdn.zuplo.com/uploads/rmoa-logo-only.svg",
        description: "Get feedback and a rating on your OpenAPI spec",
        url: "https://ratemyopenapi.com",
      },
      mockbin: {
        name: "Mockbin",
        logo: "https://cdn.zuplo.com/uploads/mockbin-logo-only.svg",
        description: "Mock an API from OpenAPI in seconds",
        url: "https://mockbin.io?utm_source=ratemyopenapi&utm_medium=web&utm_campaign=header&ref=ratemyopenapi",
      },
      uuid: {
        name: "UUID.new",
        logo: "https://cdn.zuplo.com/uploads/uuidnew-logo-only.svg",
        description: "Generate UUIDs in your browser",
        url: "https://uuid.new",
      },
    };

    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "zuplo-banner");

    // Left side: Text and logo
    const leftDiv = document.createElement("div");
    leftDiv.setAttribute("class", "left");

    const openSourceText = document.createElement("span");
    openSourceText.setAttribute("class", "open-source-text");
    openSourceText.textContent = "Open source by ";

    // Zuplo Logo using the provided SVG
    const zuploLogoContainer = document.createElement("a");
    zuploLogoContainer.setAttribute(
      "href",
      "https://zuplo.com?utm_source=ratemyopenapi",
    );
    zuploLogoContainer.setAttribute("target", "_blank");
    zuploLogoContainer.setAttribute("class", "zuplo-logo");
    zuploLogoContainer.innerHTML = `
      <!-- Zuplo SVG Logo -->
      ${this.getZuploLogoSVG()}
    `;

    leftDiv.appendChild(openSourceText);
    leftDiv.appendChild(zuploLogoContainer);

    // Right side: Button with grip icon and "View Tools" text
    const rightDiv = document.createElement("div");
    rightDiv.setAttribute("class", "right");

    const menuButton = document.createElement("button");
    menuButton.setAttribute("class", "menu-button");

    // Grip icon SVG
    const gripIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
           stroke="currentColor" fill="none" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <circle cx="2" cy="2" r="1"/>
        <circle cx="8" cy="2" r="1"/>
        <circle cx="14" cy="2" r="1"/>
        <circle cx="2" cy="8" r="1"/>
        <circle cx="8" cy="8" r="1"/>
        <circle cx="14" cy="8" r="1"/>
        <circle cx="2" cy="14" r="1"/>
        <circle cx="8" cy="14" r="1"/>
        <circle cx="14" cy="14" r="1"/>
      </svg>
    `;

    // Add "View Tools" text and icon to the button
    const buttonContent = document.createElement("span");
    buttonContent.setAttribute("class", "button-content");
    buttonContent.innerHTML = `${gripIconSVG}<span class="button-text">View Tools</span>`;

    menuButton.appendChild(buttonContent);

    rightDiv.appendChild(menuButton);

    // Append left and right divs to wrapper
    wrapper.appendChild(leftDiv);
    wrapper.appendChild(rightDiv);

    // Append wrapper to shadow root
    shadow.appendChild(wrapper);

    // Create the menu (initially hidden)
    const menu = document.createElement("div");
    menu.setAttribute("class", "menu");

    // Create menu items based on toolsData
    for (const key in toolsData) {
      const tool = toolsData[key];

      const menuItem = document.createElement("a");
      menuItem.setAttribute("href", tool.url);
      menuItem.setAttribute("class", "menu-item");
      menuItem.setAttribute("target", "_blank");

      const logo = document.createElement("img");
      logo.setAttribute("src", tool.logo);
      logo.setAttribute("alt", tool.name);

      const textContainer = document.createElement("div");
      textContainer.setAttribute("class", "text-container");

      const name = document.createElement("div");
      name.setAttribute("class", "tool-name");
      name.textContent = tool.name;

      const description = document.createElement("div");
      description.setAttribute("class", "tool-description");
      description.textContent = tool.description;

      textContainer.appendChild(name);
      textContainer.appendChild(description);
      menuItem.appendChild(logo);
      menuItem.appendChild(textContainer);

      menu.appendChild(menuItem);
    }

    // Add the footer to the menu
    const menuFooter = document.createElement("div");
    menuFooter.setAttribute("class", "menu-footer");
    menuFooter.textContent = "Created with care by Zuplo";

    menu.appendChild(menuFooter);

    // Append menu to the rightDiv instead of shadow root
    rightDiv.appendChild(menu);

    // Handle button click to toggle menu visibility
    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.classList.toggle("visible");
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (!this.contains(event.target)) {
        menu.classList.remove("visible");
      }
    });

    // Styles — Zuplo design language. CSS custom properties from the host
    // document (defined in globals.css :root) cascade into shadow DOM so the
    // banner stays visually consistent with the rest of the app.
    const style = document.createElement("style");
    style.textContent = `
      :host {
        --zb-accent: var(--color-accent, #ff00bd);
        --zb-accent-hover: var(--color-accent-hover, #e600aa);
        --zb-accent-ghost: var(--color-accent-ghost, rgba(255, 0, 189, 0.08));
        --zb-fg: var(--color-fg, #111827);
        --zb-fg-secondary: var(--color-fg-secondary, #374151);
        --zb-fg-muted: var(--color-fg-muted, #6b7280);
        --zb-fg-faint: var(--color-fg-faint, #9ca3af);
        --zb-bg: var(--color-bg, #ffffff);
        --zb-bg-subtle: var(--color-bg-subtle, #f9fafb);
        --zb-bg-muted: var(--color-bg-muted, #f3f4f6);
        --zb-border: var(--color-border, #e5e7eb);
        --zb-font-sans: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
        --zb-font-display: var(--font-display, 'Readex Pro', 'Inter', sans-serif);
      }

      * {
        font-family: var(--zb-font-sans);
        box-sizing: border-box;
      }

      .zuplo-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--zb-bg);
        color: var(--zb-fg);
        padding: 8px 24px;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        min-height: 40px;
        flex-wrap: nowrap;
      }

      .left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .open-source-text {
        font-size: 13px;
        color: var(--zb-fg-muted);
        font-weight: 500;
      }

      .left .zuplo-logo {
        display: inline-flex;
        align-items: center;
        height: 14px;
        text-decoration: none;
        transition: opacity 0.15s ease;
      }
      .left .zuplo-logo:hover {
        opacity: 0.7;
      }
      .left .zuplo-logo svg {
        height: 100%;
        width: auto;
      }

      .right {
        position: relative;
        display: flex;
        align-items: center;
      }

      .menu-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        color: var(--zb-fg-secondary);
        border: 1px solid var(--zb-border);
        padding: 0 12px;
        height: 30px;
        border-radius: 8px;
        cursor: pointer;
        font-family: var(--zb-font-sans);
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      }
      .menu-button:hover {
        background: var(--zb-bg-muted);
        color: var(--zb-fg);
      }
      .menu-button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px var(--zb-accent-ghost);
      }
      .menu-button .button-content {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .menu-button svg {
        width: 14px;
        height: 14px;
        color: var(--zb-fg-muted);
      }
      .menu-button:hover svg {
        color: var(--zb-fg);
      }

      .menu {
        display: none;
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        background-color: var(--zb-bg);
        color: var(--zb-fg);
        border: 1px solid var(--zb-border);
        border-radius: 12px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        width: 280px;
        padding: 6px;
        overflow: hidden;
      }
      .menu.visible {
        display: block;
      }

      .menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        color: var(--zb-fg);
        padding: 8px 10px;
        border-radius: 8px;
        transition: background 0.15s ease;
      }
      .menu-item + .menu-item {
        margin-top: 2px;
      }
      .menu-item:hover {
        background: var(--zb-bg-muted);
      }
      .menu-item img {
        width: 28px;
        height: 28px;
        flex-shrink: 0;
        border-radius: 6px;
      }
      .text-container {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .tool-name {
        font-family: var(--zb-font-display);
        font-weight: 600;
        font-size: 13px;
        line-height: 1.2;
        color: var(--zb-fg);
        white-space: nowrap;
      }
      .tool-description {
        font-size: 12px;
        line-height: 1.3;
        color: var(--zb-fg-muted);
      }
      .menu-footer {
        text-align: center;
        margin-top: 6px;
        padding: 8px 10px 6px;
        border-top: 1px solid var(--zb-border);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--zb-fg-faint);
      }

      @media (max-width: 640px) {
        .zuplo-banner {
          padding: 8px 16px;
        }
        .open-source-text {
          display: none;
        }
        .menu {
          width: calc(100vw - 32px);
          max-width: 320px;
        }
      }
    `;

    // Handle mode attribute. The banner is rendered against the app's white
    // surface in light mode and against the app's foreground (#111827) in
    // dark mode — both pull from the same token set as the rest of the UI.
    const mode = this.getAttribute("mode") || "light";

    if (mode === "dark") {
      style.textContent += `
        :host {
          --zb-bg: var(--color-fg, #111827);
          --zb-fg: #f8fafc;
          --zb-fg-secondary: #e2e8f0;
          --zb-fg-muted: #94a3b8;
          --zb-fg-faint: #64748b;
          --zb-bg-muted: rgba(255, 255, 255, 0.08);
          --zb-border: rgba(255, 255, 255, 0.12);
        }
        .left .zuplo-logo svg path {
          fill: #f8fafc;
        }
      `;
    } else {
      style.textContent += `
        .left .zuplo-logo svg path {
          fill: var(--zb-fg);
        }
      `;
    }

    // Append styles to shadow root
    shadow.appendChild(style);
  }

  // Method to return the Zuplo SVG logo
  getZuploLogoSVG() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" viewBox="0 0 147 33" alt="Zuplo logo" class="w-auto h-8"><path fill="#FFF" d="M27.142 19.978H16.62L27.83 8.746a.758.758 0 0 0-.534-1.293H9.488V0h19.534a7.57 7.57 0 0 1 4.065 1.125 7.6 7.6 0 0 1 2.836 3.126 7.4 7.4 0 0 1-1.461 8.398l-7.32 7.328z"></path><path fill="#FFF" d="M9.489 11.042h10.524l-11.19 11.21a.772.772 0 0 0 .543 1.316h17.759v7.452H7.61a7.57 7.57 0 0 1-4.065-1.125A7.6 7.6 0 0 1 .71 26.768a7.4 7.4 0 0 1 1.462-8.397zm73.297 5.728c0 2.657-1.034 4.283-3.46 4.244-2.227-.04-3.38-1.666-3.38-4.283V6.696h-5.488v10.43c0 5.038 3.142 8.607 8.868 8.647 5.25.04 8.948-3.807 8.948-8.606V6.697h-5.488zm53.306-10.512c-5.925 0-10.098 4.204-10.098 9.757 0 5.552 4.175 9.756 10.098 9.756s10.099-4.204 10.099-9.756-4.173-9.757-10.099-9.757m0 14.794c-2.744 0-4.69-2.063-4.69-5.037 0-2.975 1.948-5.038 4.69-5.038s4.691 2.063 4.691 5.038-1.947 5.037-4.691 5.037M101.966 6.258c-5.926 0-10.099 4.204-10.099 9.757 0 .073.009.144.01.22h-.01v15.772h5.408V24.75a10.9 10.9 0 0 0 4.691 1.02c5.926 0 10.099-4.204 10.099-9.756s-4.173-9.756-10.099-9.756m0 14.794c-2.744 0-4.69-2.063-4.69-5.037 0-2.975 1.948-5.038 4.69-5.038s4.691 2.063 4.691 5.038-1.947 5.037-4.691 5.037M49.868 11.41h10.814l-10.814 8.452v5.473h17.514v-4.716h-10.84l10.84-8.473V6.694H49.868zm74.501 13.925h-1.831a7.46 7.46 0 0 1-5.262-2.177 7.42 7.42 0 0 1-2.183-5.248V.005h5.518V17.91a1.927 1.927 0 0 0 1.927 1.921h1.831z"></path></svg>
    `;
  }
}

// Define the custom element
customElements.define("zuplo-banner", ZuploBanner);
