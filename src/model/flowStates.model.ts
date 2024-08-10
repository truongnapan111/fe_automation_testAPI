export interface flowStates {
    readonly name: string;
    readonly userId: string;
    readonly code: string;
    readonly status: string;
    readonly flowStates: [
      {
        parent: string,
        parent_tool_set_uuid: string,
        child: string,
        child_tool_set_uuid: string,
        edgeWeight: string,
      }
    ]
  }
  