/**
 * @fileoverview Enforces or disallows a space beginning a single-line comment.
 * @author Greg Cochard
 * @copyright 2014 Greg Cochard. All rights reserved.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    // Unless the first option is never, require a space
    var requireSpace = context.options[0] !== "never";

    // Default to match anything, so all will fail if there are no exceptions
    var exceptionMatcher = new RegExp(" ");

    // Grab the exceptions array and build a RegExp matcher for it
    var hasExceptions = context.options.length === 2;
    var unescapedExceptions = hasExceptions ? context.options[1].exceptions : [];
    var exceptions;

    if (unescapedExceptions.length) {
        exceptions = unescapedExceptions.map(function(s) {
            return s.replace(/([.*+?${}()|\^\[\]\/\\])/g, "\\$1");
        });
        exceptionMatcher = new RegExp("(^(" + exceptions.join(")+$)|(^(") + ")+$)");
    }


    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {

        "LineComment": function checkCommentForSpace(node) {

            if (node.loc.start.line === 1 && /^#!/.test(context.getSourceLines()[0])) {

                /*
                 * HACK: return if we are on the first line and
                 * encounter a shebang at the beginning.
                 * It seems the parser will return this as a
                 * comment and filter out the # so we must fetch
                 * the actual source line. Is this being caused
                 * by esprima or eslint? Something else?
                 */
                return;
            }

            if (requireSpace) {

                // Space expected and not found
                if (node.value.indexOf(" ") !== 0) {

                    /*
                     * Do two tests; one for space starting the line,
                     * and one for a comment comprised only of exceptions
                     */
                    if (hasExceptions && !exceptionMatcher.test(node.value)) {
                        context.report(node, "Expected exception block or space after // in comment.");
                    } else if (!hasExceptions) {
                        context.report(node, "Expected space after // in comment.");
                    }
                }

            } else {

                if (node.value.indexOf(" ") === 0) {
                    context.report(node, "Unexpected space after // in comment.");
                }
            }
        }

    };
};
