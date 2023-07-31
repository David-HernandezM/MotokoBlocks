import Map "../.mops/map@8.1.0/src/Map";
import List "mo:base/List";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import TrieMap "mo:base/TrieMap";
import Text "mo:base/Text";
import Float "mo:base/Float";
import Bool "mo:base/Bool";

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

    public type CompilationError = {
        #FunctionBadSintax : Text;
        #VariableBadSintax : Text;
        #ParameterBadSintax : Text;
        #NotAParameter : Text;
        #UnknownType : Text;
        #BadReturn : Text;
        #DuplicateGlobalVariable : Text;
        #ChangingImmutableValue : Text;
        #ChangingValueWithBadType : Text;
    };

    public type ActorProgram = {
        id : Nat;
        program : Actor;
    };

    public type Actor = {
        actorName : Text;
        globalVariables : [Variable];
        functions : [Function];
    };

    public type Function = {
        functionName : Text;
        isPublic : Bool;
        isQuery : Bool;
        isShared : Bool;
        parameters : [Variable];
        returnType : Types;
        body : [CodeBlock];
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
        #Assignment : Assignment;
        #Return : Types;
        // #Code : [CodeBlock];
    };

    public type Assignment = {
        variableName : Text;
        assignmentType : Types;
        assign : AssignmentType;
    };

    public type Variable = {
        variableName : Text;
        isStable : Bool;
        isMutable : Bool;
        varValue : Types;
        varType : Types;
        isParameter: Bool;
    };

    public type AssignmentType = {
        #Add : Types;
        #Subtract : Types;
        #Multiply : Types;
        #Divide : Types;
        #Module : Types;
        #NewValue : Types;
    };

    public type Types = {
        #IntVal : Int;
        #NatVal : Nat;
        #FloatVal : Float;
        #StringVal : Text;
        #BooleanVal : Bool;
        #Array : [Types];
        #Int;
        #Nat;
        #Float;
        #String;
        #Boolean;
        #UnitValue;
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


    public func compiler(program : Actor) : Result.Result<Text, CompilationError> {
        let programGlobalVariables = TrieMap.TrieMap<Text, (Types, Bool)>(Text.equal, Text.hash);
        let newLine = "\n";
        // var linesCode = List.nil<Text>();
        var openCodeBlocks = 1;
        var code : Text = "actor " # program.actorName # " {" # newLine;
        for (variable in Array.vals(program.globalVariables)) {
            let codeLine = getNewLinesWithTabs(openCodeBlocks);
            let textNewVariable : Text = switch (genNewVariableText(variable)) {
                case (#ok(value)) {
                    value; 
                };
                case (#err(error)) {
                    return #err(error);
                };
            };
            switch (programGlobalVariables.get(variable.variableName)) {
                case (?name) {
                    let errorMessage = "Variable name with name " # variable.variableName # " already exists";  
                    return #err(#DuplicateGlobalVariable(errorMessage));
                };
                case (_) {
                    programGlobalVariables.put(variable.variableName, (variable.varValue, variable.isMutable));
                };
            };
            code := code # codeLine # textNewVariable # newLine;
        };
        // code := code # newLine;
        for (function in Array.vals(program.functions)) {
            let codeLine = getNewLinesWithTabs(openCodeBlocks);
            code := switch (genNewFuncText(function, programGlobalVariables)) {
                case (#ok(functionInText)) {
                    code # codeLine #functionInText;
                };
                case (#err(error)) {
                    return #err(error);
                };
            };
        };
        code := code # "};";
        #ok(code);
    };

    private func codeBlockToText(codeBlock : CodeBlock, numOfTabs : Nat, globalVariables : TrieMap.TrieMap<Text, (Types, Bool)>) : Result.Result<Text, CompilationError> {
        let tabsInBlock = getNewLinesWithTabs(numOfTabs);
        var codeText: Text = "";
        switch (codeBlock) {
            case (#ControlFlow(controlFlow)) {
                switch (controlFlow) {
                    case (#If(ifContent)) {
                        let tabsInLocalBlock = numOfTabs + 1;
                        codeText := codeText # tabsInBlock # "if (" # ifContent.0 # ") {\n";
                        for (code in Array.vals(ifContent.1)) {
                            let ifCodeText = switch (codeBlockToText(code, tabsInLocalBlock, globalVariables)) {
                                case (#ok(ifCode)) {
                                    ifCode;
                                };
                                case (#err(error)) {
                                    return #err(error);
                                };
                            };
                            codeText := codeText # ifCodeText;
                        };
                        codeText := codeText # tabsInBlock # "};\n";
                    };
                    case (#For(forContent)) {
                        codeText := codeText # tabsInBlock # "for (" # forContent.0 # ") {\n";

                        codeText := codeText # tabsInBlock # "};\n";
                    };
                    case (#Switch(switchContent)) {
                        codeText := codeText # tabsInBlock # "if (" # switchContent.0 # ") {\n";

                        codeText := codeText # tabsInBlock # "};\n";
                    };
                    case (#IfElse(ifElseContent)) {
                        codeText := codeText # tabsInBlock # "if (" # ifElseContent.0 # ") {\n";

                        codeText := codeText # tabsInBlock # "} else {";

                        codeText := codeText # tabsInBlock # "};\n";
                    };
                };
            };
            case (#Variable(variable)) {
                let newVariable : Text = switch (globalVariables.get(variable.variableName)) {
                    case (?variableData) {
                        let errorMessage = "Variable name with name " # variable.variableName # " already exists";  
                        return #err(#DuplicateGlobalVariable(errorMessage));
                    };
                    case (_) {
                        switch (genNewVariableText(variable)) {
                            case (#ok(varText)) {
                                varText;
                            };
                            case (#err(error)) {
                                return #err(error);
                            };
                        };
                    };
                };
                codeText := codeText # tabsInBlock # newVariable # ";\n";
            };
            case (#Assignment(newAssignment)) {
                let newVariableAssignmentText : Text = switch (globalVariables.get(newAssignment.variableName)) {
                    case (?variableData) {
                        if (variableData.1) {
                            switch (genNewAssignmentText(newAssignment, variableData.0)) {
                                case (#ok(assignmentText)) {
                                    assignmentText;
                                };
                                case (#err(error)) {
                                    return #err(error);
                                }
                            };
                        } else {
                            return #err(#ChangingImmutableValue("Cannot change the value of an immutable variable"));
                        };
                    };
                    case (_) {
                        let errorMessage = "Variable name with name " # newAssignment.variableName # " does not exists";  
                        return #err(#DuplicateGlobalVariable(errorMessage));
                    };
                };
                codeText := codeText # newVariableAssignmentText # "\n";
            };
            case (#Return(returnType)) {
                codeText := switch(valueOfTypeToText(returnType)) {
                    case (#ok(result)) {
                        if (result.1 != #UnitValue) {
                            "return " # result.0 # ";\n";
                        } else {
                            "";
                        };
                    };
                    case (#err(error)) {
                        return #err(error);
                    };
                };
            };
        };
        #ok(codeText);
    };

     private func genNewFuncText(function : Function, globalVariables : TrieMap.TrieMap<Text, (Types, Bool)>) : Result.Result<Text, CompilationError> {
        if ((not function.isPublic) and (function.isQuery or function.isShared)) {
            return #err(#FunctionBadSintax("Function is private and Query or Shared"));
        };
        let linesOfSpace = 1;
        var newFunc: Text = "";
        if (function.isPublic) {
            newFunc := newFunc # "public ";
        };
        if (function.isShared and function.isQuery) {
            newFunc := newFunc # "shared query ({ caller }) ";
        } else if (function.isShared) {
            newFunc := newFunc # "shared ({ caller }) ";
        } else if (function.isQuery) {
            newFunc := newFunc # "query ";
        };
        newFunc := newFunc # "func " # function.functionName # "(";
        var counter : Int = function.parameters.size() - 1;
        for (parameter in Array.vals(function.parameters)) {
            let parameterText = switch (genNewParameterText(parameter)) {
                case (#ok(newParameterText)) {
                    newParameterText;
                };
                case (#err(error)) {
                    return #err(error);
                };
            };
            newFunc := newFunc # parameterText;
            newFunc := newFunc # (if (counter > 0) ", " else "");
            counter -= 1;
        };

        newFunc := newFunc # ") : ";

        let returnTypeInText = switch (typeToText(function.returnType)) {
            case (#ok(typeInText)) {
                typeInText;
            };
            case (#err(error)) {
                return #err(error);
            };
        };
        newFunc := if (function.isPublic) {
            newFunc # "async " #  returnTypeInText;
        } else {
            newFunc # returnTypeInText;
        };

        newFunc := newFunc # " {\n";

        for (functionLine in Array.vals(function.body)) {
            newFunc := switch (codeBlockToText(functionLine, linesOfSpace + 1, globalVariables)) {
                case (#ok(codeLine)) {
                    newFunc # codeLine;
                };
                case (#err(error)) {
                    return #err(error);
                };
            };
        };

        newFunc := newFunc # getNewLinesWithTabs(linesOfSpace) # "};\n";
        #ok(newFunc);
    };

    private func genNewVariableText(variable : Variable) : Result.Result<Text, CompilationError> {
        var variableStr = "";
        if (variable.isStable) {
            variableStr := variableStr # "stable ";
        };
        if (variable.isMutable) {
            variableStr := variableStr # "var ";
        } else {
            variableStr := variableStr # "let ";
        };
        variableStr := variableStr # variable.variableName # " : ";
        switch (variable.varValue) {
            case (#NatVal(value)) {
                variableStr := variableStr # "Nat = " # Nat.toText(value);
            };
            case (_) {

            };
        };
        variableStr := variableStr # ";";
        #ok(variableStr);
    };

    private func genNewAssignmentText(assignment : Assignment, variableType : Types) : Result.Result<Text, CompilationError> {
        if (assignment.assignmentType != variableType) {
            let errMsg = switch (typeToText(variableType)) {
                case (#ok(typeTxt)) {
                    "Incompatible type with variable type : " #  typeTxt;
                };
                case (#err(error)) {
                    return #err(error);
                }
            };
            return #err(#ChangingValueWithBadType(errMsg));
        };
        var codeText = "";
        switch (assignment.assign) {
            case (#Add(value)) {
                 codeText := switch (valueOfTypeToText(value)) {
                    case (#ok(result)) {
                        if (result.1 != variableType) {
                            return #err(#ChangingValueWithBadType("Type assignment and type value are not the same"));
                        };
                        assignment.variableName # " += " # result.0 # ";\n";
                    };
                    case (#err(error)) {
                        return #err(error);
                    };
                 };
            };
            case (#Subtract(value)) {
                codeText := switch (valueOfTypeToText(value)) {
                    case (#ok(result)) {
                        if (result.1 != variableType) {
                            return #err(#ChangingValueWithBadType("Type assignment and type value are not the same"));
                        };
                        assignment.variableName # " -= " # result.0 # ";\n";
                    };
                    case (#err(error)) {
                        return #err(error);
                    };
                 };
            };
            case (#Multiply(value)) {
                codeText := switch (valueOfTypeToText(value)) {
                    case (#ok(result)) {
                        if (result.1 != variableType) {
                            return #err(#ChangingValueWithBadType("Type assignment and type value are not the same"));
                        };
                        assignment.variableName # " *= " # result.0 # ";\n";
                    };
                    case (#err(error)) {
                        return #err(error);
                    };
                 };
            };
            case (#Divide(value)) {
                codeText := switch (valueOfTypeToText(value)) {
                    case (#ok(result)) {
                        if (result.1 != variableType) {
                            return #err(#ChangingValueWithBadType("Type assignment and type value are not the same"));
                        };
                        assignment.variableName # " /= " # result.0 # ";\n";
                    };
                    case (#err(error)) {
                        return #err(error);
                    };
                 };
            };
            case (#Module(value)) {
                codeText := switch (valueOfTypeToText(value)) {
                    case (#ok(result)) {
                        if (result.1 != variableType) {
                            return #err(#ChangingValueWithBadType("Type assignment and type value are not the same"));
                        };
                        assignment.variableName # " %= " # result.0 # ";\n";
                    };
                    case (#err(error)) {
                        return #err(error);
                    };
                 };
            };
            case (#NewValue(value)) {
                codeText := switch (valueOfTypeToText(value)) {
                    case (#ok(result)) {
                        if (result.1 != variableType) {
                            return #err(#ChangingValueWithBadType("Type assignment and type value are not the same"));
                        };
                        assignment.variableName # " := " # result.0 # ";\n";
                    };
                    case (#err(error)) {
                        return #err(error);
                    };
                 };
            };
        };
        #ok(codeText);
    };

    private func genNewParameterText(parameter : Variable) : Result.Result<Text, CompilationError> {
        if (not parameter.isParameter) {
            return #err(#NotAParameter("The variable signature is not a parameter"));
        };
        if (parameter.isParameter and (parameter.isStable or parameter.isMutable)) {
            return #err(#ParameterBadSintax("Bad sintax in parameter"));
        };
        var parameterType = switch (typeToText(parameter.varType)) {
            case (#ok(typeText)) {
                typeText;
            };
            case (#err(error)) {
                return #err(error);
            };
        };
        let parameterStr = parameter.variableName # " : " # parameterType;
        #ok(parameterStr);
    };

    private func typeToText(valueType : Types) : Result.Result<Text, CompilationError> {
        var parameterType: Text = "";
        switch (valueType) {
            case (#Int) {
                parameterType := "Int";
            };
            case (#Nat) {
                parameterType := "Nat";
            };
            case (#Float) {
                parameterType := "Float";
            };
            case (#String) {
                parameterType := "String";
            };
            case (#Boolean) {
                parameterType := "Bool";
            };
            case (_) {
                return #err(#UnknownType("Unknown type used"));
            };
        };
        #ok(parameterType);
    };

    private func valueOfTypeToText(valueType : Types) : Result.Result<(Text, Types), CompilationError> {
        switch (valueType) {
            case (#IntVal(value)) {
                #ok((Int.toText(value), #Int));
            };
            case (#NatVal(value)) {
                #ok((Nat.toText(value), #Nat));
            };
            case (#FloatVal(value)) {
                #ok((Float.toText(value), #Float));
            };
            case (#StringVal(value)) {
                #ok(value, #String);
            };
            case (#BooleanVal(value)) {
                #ok((Bool.toText(value), #Boolean));
            };
            case (_) {
                #err(#UnknownType("Unknown type used"));  
            };
        };
    };

    private func getNewLinesWithTabs(numTabs : Nat) : Text {
        var line = "";
        var tabs = numTabs;
        while (tabs > 0) {
            line := line # "\t";
            tabs -= 1;
        };
        line;
    };
};