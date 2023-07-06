# Rate My OpenAPI Core

This repo contains the core rating logic that is shared between the CLI and the
webtool for ranking OpenAPI files.

## Making Changes

If you decide to make changes to any of the rating utils, run

```
npm run build
```

so the deps of the downstream tool (ex. CLI) get updated.

## Issue Format Compatibility

This repo can use issue reports generated in the Spectral Format, either from
Spectral directly - or through Vacuum.

## Expected Rulesets

You can find the expected rulesets in [rulesets](../../rulesets). You can
customize these rulesets but the category reports (ex. Docs quality) will not
adapt to any new rules. If you turn rules off or changing their severity,
category rulesets containing those rules will be affected.

## Scoring Methodology

Scoring is performed in a bottoms-up fashion, with the lowest level of entity in
an OpenAPI spec (ex. a component or operation) being evaluated based on its
issues and their severity. The next-level in hierarchy's score will be an
average of the scores of its children (ex. a path's score is the average of the
operations under it). This is to avoid large APIs with many endpoints and issues
being penalized unfairly. This also allows users to dig into specific scores for
endpoints they are responsible for and view the issues they can fix.

## Categories

In addition to an overall score for each level of hierarchy, additional category
scores were created by specifically focusing on sets of rules that were deemed
most important to those categories. The current categories are:

- Docs Quality: Measure of quality of documentation that can be generated from
  this spec. Missing fields like examples and responses affects this score.
- Completeness: How complete is this OpenAPI spec? Does it fill out many of the
  non-required but nice-to-have properties? Missing fields like descriptions
  affects this score.
- SDK Generation: How suitable is this OpenAPI spec for generating an SDK? We
  utilized recommendations from Apimatic to generate this score. Proper naming
  and component usage affect this score.
- Security (Inspired by OWASP recommendations): How vulnerable is this API to
  OWASP's Top 10 attack vectors? Contract-testing plays a large role here, so
  documenting all possible responses affects this score.
