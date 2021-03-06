"use strict";

import { CursoredToSlackOption } from "./copytoslack-option";

/**
 * Persistence options key.
 * @type {string}
 */
const OptionsKey = "hoge";

/**
 * ContextMenuId
 * @type {string}
 */
const ContextMenuId = "fuga";

/**
 */
export default class CursoredToSlack {
  /**
   * Represents a CursoredToSlack
   * @constructor
   * @param {object} chrome API
   */
  constructor(chrome) {
    this.chrome = chrome;
  }

  /**
   * Get persistence options.
   * @return {Promise} options returned if it resolved.
   */
  async getOptions() {
    return new Promise((resolve) => {
      this.chrome.storage.sync.get([OptionsKey], (result) => {
        const value = new CursoredToSlackOption(result[OptionsKey]);
        resolve(value);
      });
    });
  }

  /**
   * Set persistence options.
   * @param {object} object has persistence options.
   * @return {Promise} returns bool if it resolved.
   */
  async setOptions(value) {
    return new Promise((resolve, reject) => {
      if (value instanceof CursoredToSlackOption === false) {
        reject(new Error("wrong instanceof"));
        return;
      }
      this.chrome.storage.sync.set({ [OptionsKey]: value }, () => {
        resolve(true);
      });
    });
  }

  /**
   * contextMenus.onClicked callback.
   *
   * this is used by addContextMenu() function.
   * @see {@link https://developer.chrome.com/extensions/contextMenus#event-onClicked}
   */
  async contextMenuOnClickedCallback(info) {
    const isMyEvent = ContextMenuId === info.menuItemId;
    if (!isMyEvent) {
      return;
    }

    let message = "";
    const orderList = [
      "selectionText",
      "linkUrl",
      "srcUrl",
      "pageUrl",
      "frameUrl",
    ];
    for (const order of orderList) {
      if (info[order]) {
        message = info[order];
        break;
      }
    }
    if (!message) {
      console.log("no contents");
      return;
    }

    const options = await this.getOptions();
    this.sendRequestToSlackApi(message, options.webhookUrl);
  }

  /**
   * Add context menu.
   */
  addContextMenu() {
    // add onClicked callback.
    this.chrome.contextMenus.onClicked.addListener(
      this.contextMenuOnClickedCallback.bind(this)
    );

    // const contexts = ["page", "selection", "link", "editable", "image", "video", "audio"];
    const contexts = ["all"];
    this.chrome.contextMenus.create({
      id: ContextMenuId,
      type: "normal",
      title: "Send to Slack",
      contexts: contexts,
      visible: true,
    });
  }

  /**
   * Send request to Slack API.
   * @param {string} text Properties of post body.
   * @param {string} webhookUrl SlackWebhookUrl
   */
  async sendRequestToSlackApi(text, webhookUrl) {
    // build data
    const body = { text: text };

    return await fetch(webhookUrl, {
      method: "POST",
      cache: "no-cache",
      headers: {
        // NOTE: Slack Webhook does not support preflight.
        // https://api.slack.com/web
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.text())
      .then((body) => body);
  }
}
