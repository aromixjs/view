export interface AVTagNode {
  type: "tag";
  name: string;
  attributes: Record<string, string>;
  children: AvHtmlIR[];
}

export interface AVTextNode {
  type: "text";
  value: string;
}

export type AvHtmlIR = AVTagNode | AVTextNode;

export interface RenderInput {
  htmlIR: Array<AvHtmlIR>;
  uuid: string;
}

export class AVIRRenderer {
  private input: RenderInput;
  constructor(input: RenderInput) {
    this.input = input;
  }

  public toHtml() {
    let html = "";
    for (const node of this.input.htmlIR) {
      html += this.renderRoot(node);
    }
    return html;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private renderRoot(node: AvHtmlIR) {
    switch (node.type) {
      case "text":
        return this.escapeHtml(node.value);

      case "tag":
        return this.renderRootTag(node);
    }
  }

  private renderRootTag(node: AVTagNode) {
    let html = `<${node.name} data-av="${this.escapeHtml(this.input.uuid)}"`;

    for (const [key, value] of Object.entries(node.attributes)) {
      html += ` ${key}="${this.escapeHtml(value)}"`;
    }

    html += ">";
    for (const child of node.children) {
      html += this.renderNode(child);
    }

    html += `</${node.name}>`;
    return html;
  }

  private renderNode(node: AvHtmlIR): string {
    switch (node.type) {
      case "text":
        return this.escapeHtml(node.value);
      case "tag":
        return this.renderTag(node);
    }
  }

  private renderTag(node: AVTagNode): string {
    let html = `<${node.name}`;
    for (const [key, value] of Object.entries(node.attributes)) {
      html += ` ${key}="${this.escapeHtml(value)}"`;
    }
    html += ">";
    for (const child of node.children) {
      html += this.renderNode(child);
    }
    html += `</${node.name}>`;
    return html;
  }
}
