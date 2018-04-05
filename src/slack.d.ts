export declare type ISlackEvent = ISlackUrlVerification | ISlackEventCallback;

export interface ISlackUrlVerification {
  type: "url_verification";
  token: string;
  challenge: string;
}

export interface ISlackEventCallback {
  type: "event_callback";
  token: string;
  team_id: string;
  api_app_id: string;
  event: ISlackEventAppMention;
  authed_users: string[];
  event_id: string;
  event_time: number;
}

export interface ISlackEventBody {
  type: string;
  event_ts: string;
  user: string;
  ts: string;
}

export interface ISlackEventAppMention extends ISlackEventBody {
  type: "app_mention";
  text: string;
  channel: string;
}
