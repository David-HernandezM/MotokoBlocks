import Utils "./Utils";
import Map "../.mops/map@8.1.0/src/Map"; //"mo:map/Map";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Buffer "mo:base/Buffer";
import List "mo:base/List";
import Nat "mo:base/Nat";

actor class Backend() {
  let { phash } = Map;
  stable let counts = Map.new<Principal, Utils.UserProgramsType>(phash);
  let loggedAccounts = Buffer.Buffer<Principal>(0);

  public shared ({ caller }) func register() : async Result.Result<(), Utils.UserError> {
    if (Principal.isAnonymous(caller)) {
      return #err(#Anonymous("Account can't be Anonymous"));
    };
    if (Utils.principalIsRegistered(counts, caller)) {
      return #err(#RegisterError("Account is already registered"));
    };
    Map.set(counts, phash, caller, (0, List.nil()));
    #ok(());
  };

  public shared ({ caller }) func login() : async Result.Result<(), Utils.UserError> {
    if (Principal.isAnonymous(caller)) {
      return #err(#Anonymous("Account can't be Anonymous"));
    };
    if (not Utils.principalIsRegistered(counts, caller)) {
      return #err(#LoginError("Account is not registered"));
    };
    loggedAccounts.add(caller);
    #ok(());
  };

  public shared ({ caller }) func logOut() : async Result.Result<(), Utils.UserError> {
    if (Principal.isAnonymous(caller)) {
      return #err(#Anonymous("Account can't be Anonymous"));
    };
    let indexElement : ?Nat = Buffer.indexOf<Principal>(caller, loggedAccounts, Principal.equal);
    switch (indexElement) {
      case (?index) {
        ignore loggedAccounts.remove(index);
      }; 
      case (null) {
        return #err(#AccountNotLogged("Account is not logged"));
      };
    };
    #ok(());
  };

  public shared query ({ caller }) func userIsLogged() : async Bool {
    if (Principal.isAnonymous(caller)) {
      return false;
    };
    if (not Buffer.contains<Principal>(loggedAccounts, caller, Principal.equal)) {
      return false;
    };
    true;
  };

  public shared query ({ caller }) func getActorsNamesAndId() : async Result.Result<[(Nat, Text)], Utils.UserError> {
    if (Principal.isAnonymous(caller)) {
      return #err(#Anonymous("Account can't be Anonymous"));
    };
    if (not Utils.principalIsLogged(loggedAccounts, caller)) {
      return #err(#AccountNotLogged("Account is not logged"));
    };
    let userPrograms = switch (Map.get<Principal, Utils.UserProgramsType>(counts, phash, caller)) {
      case (?actors) {
        actors.1;
      };
      case (null) {
        return #err(#AccountNotLogged("Account is not logged"));
      };
    };
    if (List.isNil<Utils.ActorProgram>(userPrograms)) {
      return #ok([]);
    };

    let actorNames = Buffer.Buffer<(Nat, Text)>(0);
    List.iterate<Utils.ActorProgram>(
      userPrograms,
      func actorProgram { 
        let programName : Text = actorProgram.program.actorName;
        let programId : Nat = actorProgram.id;
        actorNames.add((programId, programName)); 
      }
    );
    #ok(Buffer.toArray<(Nat, Text)>(actorNames));
  };

  public shared query ({ caller }) func getActorWithId(actorId : Nat) : async Result.Result<Utils.ActorProgram, Utils.UserError> {
    if (Principal.isAnonymous(caller)) {
      return #err(#Anonymous("Account can't be Anonymous"));
    };
    if (not Utils.principalIsLogged(loggedAccounts, caller)) {
      return #err(#AccountNotLogged("Account is not logged"));
    };

    let userPrograms = switch (Map.get<Principal, Utils.UserProgramsType>(counts, phash, caller)) {
      case (?programs) {
        programs.1;
      };
      case (_) {
        return #err(#AccountNotLogged("Account is not logged")); 
      };
    };
    if (List.isNil<Utils.ActorProgram>(userPrograms)) {
      return #err(#WithoutPrograms("The user has no programs"));
    };

    let program = List.find<Utils.ActorProgram>(
      userPrograms,
      func actorProgram { actorProgram.id == actorId }
    );
    switch (program) {
      case (?value) {
        return #ok(value);
      };
      case (_) {
        #err(#ProgramNotExists("Program with id " # Nat.toText(actorId) # " not exists"));
      };
    };
  };

  public shared ({ caller }) func updateCodeWithId(programId : Nat, program : Utils.Actor) : async Result.Result<(), Utils.UserError> {
    if (Principal.isAnonymous(caller)) {
      return #err(#Anonymous("Account can't be Anonymous"));
    };
    if (not Utils.principalIsLogged(loggedAccounts, caller)) {
      return #err(#AccountNotLogged("Account is not logged"));
    };
    let userPrograms : Utils.UserProgramsType = switch (Map.get<Principal, Utils.UserProgramsType>(counts, phash, caller)) {
      case (?actualPrograms) {
        actualPrograms;
      };
      case (null) {
        return #err(#ProgramNotExists("Program with id " # Nat.toText(programId) # " not exists"));
      };
    };

    let currentUserGeneralId : Nat = userPrograms.0;
    var currentProgramId : Nat = 0;
    let newList = List.mapFilter<Utils.ActorProgram, Utils.ActorProgram>(
      userPrograms.1,
      func value {
        if (value.id == programId) {
          currentProgramId := value.id;
          null;
        } else {
          ?(value);
        }
      }
    );
    let updatedProgram : Utils.ActorProgram = {
      program = program; 
      id = programId;
    };
    let listUpdated = List.push<Utils.ActorProgram>(updatedProgram, newList);
    let programsUserUpdated : Utils.UserProgramsType = (currentUserGeneralId, listUpdated);
    ignore Map.replace<Principal, Utils.UserProgramsType>(counts, phash, caller, programsUserUpdated);
    #ok(());
  };
  
  public shared ({ caller }) func addProgramToPrincipal(program : Utils.Actor) : async Result.Result<(), Utils.UserError> {
    if (Principal.isAnonymous(caller)) {
      return #err(#Anonymous("Account can't be Anonymous"));
    };
    if (not Utils.principalIsLogged(loggedAccounts, caller)) {
      return #err(#AccountNotLogged("Account is not logged"));
    };
    let userPrograms : Utils.UserProgramsType = switch (Map.get<Principal, Utils.UserProgramsType>(counts, phash, caller)) {
      case (?programs) {
        programs;
      };
      case (_) {
        return #err(#AccountNotLogged("Account is not logged")); 
      };
    };
    let newProgram : Utils.ActorProgram = {
      program = program;
      id = userPrograms.0;
    };
    let listUpdated = List.push<Utils.ActorProgram>(newProgram, userPrograms.1);
    let programsUserUpdated : Utils.UserProgramsType = ((userPrograms.0) + 1, listUpdated);
    ignore Map.replace<Principal, Utils.UserProgramsType>(counts, phash, caller, programsUserUpdated);
    #ok(());
  };


  // Compilador ------------------------

  public shared query ({ caller }) func compileCodeWithId(programId : Nat) : async Text {

  };
};