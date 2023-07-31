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

  public shared query ({ caller }) func compileCodeWithId(programId : Nat) : async Result.Result<Text, Utils.UserError> {
    if (Principal.isAnonymous(caller)) {
      return #err(#Anonymous("Account can't be Anonymous"));
    };
    if (not Utils.principalIsLogged(loggedAccounts, caller)) {
      return #err(#AccountNotLogged("Account is not logged"));
    };

    #ok("ok");
  };

  public shared query ({ caller }) func whoAmI() : async Principal {
    let newActor : Utils.Actor = {
        actorName = "Backend";
        globalVariables = [
            {
                variableName = "Primero";
                isStable = false;
                isMutable = true;
                varValue = #NatVal(7);
                varType = #Nat;
                isParameter = false;
            }
        ];
        functions = [
              {
                functionName = "testFunc";
                isPublic = true;
                isQuery = true;
                isShared = true;
                parameters = [
                    {
                        variableName = "a";
                        isStable = false;
                        isMutable = false;
                        varValue = #NatVal(5);
                        varType = #Nat;
                        isParameter = true;
                    },
                    {
                        variableName = "b";
                        isStable = false;
                        isMutable = false;
                        varValue = #NatVal(4);
                        varType = #Nat;
                        isParameter = true;
                    },
                ];
                returnType = #Int;
                body = [
                    #Variable ({
                        variableName = "z";
                        isStable = false;
                        isMutable = true;
                        varValue = #BooleanVal(false);
                        varType = #Boolean;
                        isParameter = false;
                    }),
                    #ControlFlow (
                      #If ((
                        "Condicional", 
                        [ 
                          #Assignment ({
                           variableName = "Primero";
                           assignmentType = #Nat;
                           assign = #NewValue(#NatVal(0)) 
                          }) 
                        ]
                      )),
                    ),
                    #Return(#NatVal(6))
                ];
            }
        ];
    };

    caller;
  };

  public func test1() : async Result.Result<Text, Utils.CompilationError> {
    /**
    actor test1 {
    };
    **/
    let actorTest : Utils.Actor = {
      actorName = "test1";
      globalVariables = [];
      functions = [];
    };
    switch (Utils.compiler(actorTest)) {
      case (#ok(programText)) {
        #ok(programText);
      };
      case (#err(error)) {
        #err(error);
      };
    };
  };

  public func test2() : async Result.Result<Text, Utils.CompilationError> {
    /**
    actor test2 {
      let x : Nat = 4;
      var y : Int = -2;
    };
    **/
    let actorTest : Utils.Actor = {
      actorName = "test2";
      globalVariables = [
        {
            variableName = "Primero";
            isStable = true;
            isMutable = true;
            varValue = #NatVal(7);
            varType = #Nat;
            isParameter = false;
        },
        {
            variableName = "Segundo";
            isStable = true;
            isMutable = false;
            varValue = #NatVal(7);
            varType = #Nat;
            isParameter = false;
        },
        {
            variableName = "Tercero";
            isStable = false;
            isMutable = true;
            varValue = #NatVal(7);
            varType = #Nat;
            isParameter = false;
        },
        {
            variableName = "Cuarto";
            isStable = false;
            isMutable = false;
            varValue = #NatVal(7);
            varType = #Nat;
            isParameter = false;
        }
      ];
      functions = [];
    };
    switch (Utils.compiler(actorTest)) {
      case (#ok(programText)) {
        #ok(programText);
      };
      case (#err(error)) {
        #err(error);
      };
    };
  };

  public func test3() : async Result.Result<Text, Utils.CompilationError> {
    /**
    actor test3 {
      public shared query ({caller}) func five() : Nat {
        return 5;
      };
    };
    **/
    let actorTest : Utils.Actor = {
      actorName = "test3";
      globalVariables = [
        {
            variableName = "Primero";
            isStable = true;
            isMutable = true;
            varValue = #NatVal(7);
            varType = #Nat;
            isParameter = false;
        },
        {
            variableName = "Segundo";
            isStable = true;
            isMutable = false;
            varValue = #NatVal(7);
            varType = #Nat;
            isParameter = false;
        },
        {
            variableName = "Tercero";
            isStable = false;
            isMutable = true;
            varValue = #NatVal(7);
            varType = #Nat;
            isParameter = false;
        },
        {
            variableName = "Cuarto";
            isStable = false;
            isMutable = false;
            varValue = #NatVal(7);
            varType = #Nat;
            isParameter = false;
        }
      ];
      functions = [
        {
          functionName = "testFun1";
          isPublic = true;
          isQuery = true;
          isShared = true;
          parameters = [
            {
                  variableName = "a";
                  isStable = false;
                  isMutable = false;
                  varValue = #IntVal(5);
                  varType = #Int;
                  isParameter = true;
              },
              {
                  variableName = "b";
                  isStable = false;
                  isMutable = false;
                  varValue = #NatVal(4);
                  varType = #Nat;
                  isParameter = true;
              },
          ];
          returnType = #Nat;
          body = [];
        },
        {
          functionName = "testFun2";
          isPublic = true;
          isQuery = false;
          isShared = true;
          parameters = [
            {
                  variableName = "a";
                  isStable = false;
                  isMutable = false;
                  varValue = #IntVal(5);
                  varType = #Int;
                  isParameter = true;
              },
              {
                  variableName = "b";
                  isStable = false;
                  isMutable = false;
                  varValue = #NatVal(4);
                  varType = #Nat;
                  isParameter = true;
              },
          ];
          returnType = #Nat;
          body = [];
        },
        {
          functionName = "testFunc3";
          isPublic = true;
          isQuery = true;
          isShared = false;
          parameters = [
            {
                  variableName = "a";
                  isStable = false;
                  isMutable = false;
                  varValue = #IntVal(5);
                  varType = #Int;
                  isParameter = true;
              },
              {
                  variableName = "b";
                  isStable = false;
                  isMutable = false;
                  varValue = #NatVal(4);
                  varType = #Nat;
                  isParameter = true;
              },
          ];
          returnType = #Nat;
          body = [];
        },
        {
          functionName = "testFunc4";
          isPublic = true;
          isQuery = false;
          isShared = false;
          parameters = [
            {
                  variableName = "a";
                  isStable = false;
                  isMutable = false;
                  varValue = #IntVal(5);
                  varType = #Int;
                  isParameter = true;
              },
              {
                  variableName = "b";
                  isStable = false;
                  isMutable = false;
                  varValue = #NatVal(4);
                  varType = #Nat;
                  isParameter = true;
              },
          ];
          returnType = #Nat;
          body = [];
        },
        {
          functionName = "testFunc5";
          isPublic = false;
          isQuery = false;
          isShared = false;
          parameters = [
            {
                  variableName = "a";
                  isStable = false;
                  isMutable = false;
                  varValue = #IntVal(5);
                  varType = #Int;
                  isParameter = true;
              },
              {
                  variableName = "b";
                  isStable = false;
                  isMutable = false;
                  varValue = #NatVal(4);
                  varType = #Nat;
                  isParameter = true;
              },
          ];
          returnType = #Nat;
          body = [];
        },
      ];
    };
    switch (Utils.compiler(actorTest)) {
      case (#ok(programText)) {
        #ok(programText);
      };
      case (#err(error)) {
        #err(error);
      };
    };
  };

  public func test4() : async Result.Result<Text, Utils.CompilationError> {
    /**
    actor test4 {
      var Primero : Nat = 7;
      public shared query ({ caller }) func testFunc(a : Nat, b : Nat) : async Int {
        var z : Bool = false;
        if (Condicional) {
          Primero := 0;
        };
        return 6;
      };
    };
    **/
    let actorTest : Utils.Actor = {
        actorName = "Backend";
        globalVariables = [
            {
                variableName = "Primero";
                isStable = false;
                isMutable = true;
                varValue = #NatVal(7);
                varType = #Nat;
                isParameter = false;
            }
        ];
        functions = [
              {
                functionName = "testFunc";
                isPublic = true;
                isQuery = true;
                isShared = true;
                parameters = [
                    {
                        variableName = "a";
                        isStable = false;
                        isMutable = false;
                        varValue = #NatVal(5);
                        varType = #Nat;
                        isParameter = true;
                    },
                    {
                        variableName = "b";
                        isStable = false;
                        isMutable = false;
                        varValue = #NatVal(4);
                        varType = #Nat;
                        isParameter = true;
                    },
                ];
                returnType = #Int;
                body = [
                    #Variable ({
                        variableName = "z";
                        isStable = false;
                        isMutable = true;
                        varValue = #BooleanVal(false);
                        varType = #Boolean;
                        isParameter = false;
                    }),
                    #ControlFlow (
                      #If ((
                        "Condicional", 
                        [ 
                          #Assignment ({
                           variableName = "Primero";
                           assignmentType = #Nat;
                           assign = #NewValue(#NatVal(0)) 
                          }) 
                        ]
                      )),
                    ),
                    #Return(#NatVal(6))
                ];
            }
        ];
    };
    switch (Utils.compiler(actorTest)) {
      case (#ok(programText)) {
        #ok(programText);
      };
      case (#err(error)) {
        #err(error);
      };
    };
  };
};