import { Backend } "../Backend";
import Debug "mo:base/Debug";
import Text "mo:base/Text";

let backend = await Backend();

let actorTextExpected : Text = "actor test1 {\n};";

switch (await backend.testActorCodeOk()) {
    case (#ok(code)) {
        assert Text.equal(code, actorTextExpected);
    };
    case (#err(error)) {
        assert false;
    };
};
