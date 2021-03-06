import CursoredToSlack from "./copytoslack";
import { CursoredToSlackOption } from "./copytoslack-option";

const mockOptions = {
  storage: {
    sync: {
      values: {},
      get(key, f) {
        f(this.values);
      },
      set(keyValue, f) {
        this.values = keyValue;
        f();
      },
    },
  },
};
describe("options", () => {
  test("get/set", async () => {
    const c = new CursoredToSlack(mockOptions);
    let done, options, got;

    options = { test: "hi", sub: { test: "hello" } };
    done = await c.setOptions(options).catch((error) => {
      return error;
    });
    expect(done).toStrictEqual(new Error("wrong instanceof"));

    got = await c.getOptions().catch((error) => {
      return error;
    });
    expect(got.webhookPath).toBe("");

    options = new CursoredToSlackOption();
    options.webhookPath = "HZ54X/B01KE0V/Z251nBgwCPG";
    done = await c.setOptions(options).catch((error) => {
      return error;
    });
    expect(done).toBe(true);

    got = await c.getOptions();
    expect(got.webhookPath).toBe("HZ54X/B01KE0V/Z251nBgwCPG");
  });
});

// HACK: Does this test need?
const mockContextMenu = {
  contextMenus: {
    create(params) {
      this.params = params;
    },
    onClicked: {
      addListener(callback) {
        this.callback = callback;
      },
    },
  },
};
describe("context menu", () => {
  test("create", () => {
    const c = new CursoredToSlack(mockContextMenu);
    c.addContextMenu();

    expect(mockContextMenu.contextMenus.params.type).toBe("normal");
    expect(mockContextMenu.contextMenus.params.title).toBe("Send to Slack");
    expect(mockContextMenu.contextMenus.params.contexts).toMatchObject(["all"]);
    expect(mockContextMenu.contextMenus.params.visible).toBe(true);
  });
  test.skip("onClicked", () => {
    const c = new CursoredToSlack(mockContextMenu);
    c.addContextMenu();
    // todo: check message
  });
});

const mockApi = function () {
  return {
    storage: {
      sync: {
        values: {},
        get(key, f) {
          f(this.values);
        },
        set(keyValue, f) {
          this.values = keyValue;
          f();
        },
      },
    },
  };
};
describe("sendRequestToSlackApi", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test("success", async () => {
    const mockResponse = "ok";
    fetch.mockResponse(mockResponse);

    const c = new CursoredToSlack(mockApi());
    const option = new CursoredToSlackOption();
    option.webhookPath = "HZ54X/B01KE0V/Z251nBgwCPG";
    c.setOptions(option);
    const resp = await c
      .sendRequestToSlackApi("test", "https//localhost/abc/def")
      .catch((error) => error);
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][0]).toBe("https//localhost/abc/def");
    expect(resp).toBe(mockResponse);
  });
});
