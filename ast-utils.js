var acorn = require("acorn");
acorn.walk = require("acorn/dist/walk");
/*
  j-bracket-assign(j-dot(j-id(e), "stack"),
    j-unop(rt-field("EXN_STACKHEIGHT"), J.j-postincr), act-record)
*/



function buildVisitor(activationRecordCallback) {
  return {
    AssignmentExpression: function(node) {
      // First we "pattern match" to check that this is an
      // activation record
      /*
        Should be $eXX[R.EXN_STACKHEIGHT++] = R.makeActivationRecord(...);
        node.type == "AssignmentExpression"
        node.operator: AssignmentOperator
        node.left: Pattern | Expression
        node.right: Expression
      */
      if (node.operator !== "="
          || node.left.type !== "MemberExpression"
          || node.right.type !== "CallExpression") {
        return;
      }
      /*
        Should be $eXX[R.EXN_STACKHEIGHT++]
        node.left.type == "MemberExpression"
        node.left.object: Expression
        node.left.property: Expression
        node.left.computed: boolean
      */
      if (!node.left.computed
          || node.left.property.type !== "UpdateExpression") {
        return;
      }
      // 
      /*
        Should be R.EXN_STACKHEIGHT++
        updateExpr.type == "UpdateExpression"
        updateExpr.operator: "++" | "--"
        updateExpr.argument: Expression
        updateExpr.prefix: boolean
      */
      var updateExpr = node.left.property;
      if (updateExpr.operator !== "++"
          || updateExpr.prefix
          || updateExpr.argument.type !== "MemberExpression") {
        return;
      }

      /*
        Should be R.EXN_STACKHEIGHT
        exnStackheight.type == "MemberExpression"
        exnStackheight.object: Expression
        exnStackheight.property: Expression
        exnStackheight.computed: boolean (false => exnStackheight.property.type == "Identifier")
      */
      var exnStackheight = updateExpr.argument;
      if (exnStackheight.computed
          || exnStackheight.object.type !== "Identifier"
          || exnStackheight.property.name !== "EXN_STACKHEIGHT") {
        return;
      }
      var runtimeName = exnStackheight.object.name;

      /*
        Should be R.makeActivationRecord(...)
        node.right.type == "CallExpression"
        node.right.callee: Expression
        node.right.arguments: [ Expression ]
      */
      if (node.right.callee.type !== "MemberExpression"
          || node.right.arguments.length !== 5) {
        return;
      }

      /*
        Should be R.makeActivationRecord
        callee.type == "MemberExpression"
        callee.object: Expression
        callee.property: Expression
        callee.computed: boolean (false => exnStackheight.property.type == "Identifier")
      */
      var callee = node.right.callee;
      if (callee.computed
          || callee.object.type !== "Identifier"
          || callee.property.name !== "makeActivationRecord"
          || callee.object.name !== runtimeName) {
        return;
      }
      // If we get here, we have a match.
      activationRecordCallback(node.right);
    }
  };
}

function getActivationRecords(srccode, callback) {
  acorn.walk.simple(acorn.parse(srccode), buildVisitor(callback));
}

module.exports = {
  'getActivationRecords': getActivationRecords
};
