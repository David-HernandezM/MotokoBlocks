import Map "../.mops/map@8.1.0/src/Map";
import List "mo:base/List";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";

module {

    //   TYPES  -----------------------

    public type UserProgramsType = (Nat, List.List<ActorProgram>);

    public type UserError = {
        #LoginError : Text;
        #RegisterError : Text;
        #AccountNotLogged : Text;
        #Anonymous : Text;
        #ProgramNotExists : Text;
        #WithoutPrograms : Text;
    };

    public type ActorProgram = {
        id : Nat;
        program : Actor;
    };

    public type Actor = {
        actorName : Text;
        variables : [Variable];
        functions : [Function];
    };

    public type Function = {
        isPublic : Bool;
        isQuery : Bool;
        hasHandle : Bool;
        parameters : [(Text, Types)];
        returnType : Types;
        body : CodeBlock;
    };

    public type ControlFlow = {
        #If : (Text, [CodeBlock]);
        #For : (Text, [CodeBlock]);
        #Switch : (Text, [CodeBlock]);
        #IfElse : (Text, [CodeBlock], [CodeBlock]);
    };  

    public type CodeBlock = {
        #ControlFlow : ControlFlow;
        #Variable : Variable;
        #Code : [CodeBlock];
    };

    public type Variable = {
        isStable : Bool;
        isMutable : Bool;
        varValue : Types;
    };

    public type Types = {
        #Int : Int;
        #Nat : Nat;
        #Float : Float;
        #String : Text;
        #Boolean : Bool;
        #Array : [Types];
        #Null;
    };

    // private functions -----------------------

    public func principalIsRegistered(accounts : Map.Map<Principal, (Nat, List.List<ActorProgram>)>, user : Principal) : Bool {
        let { phash } = Map;
        switch (Map.get(accounts, phash, user)) {
            case (?userPrincipal) { true };
            case (null) { false };
        };
    };

    public func principalIsLogged(accounts : Buffer.Buffer<Principal>, user : Principal) : Bool {
        Buffer.contains<Principal>(accounts, user, Principal.equal);
    };
};