# ADR 0017: Application Model Storage as Structured JSON

## Status
Accepted

## Context
During Phase 5, we introduced the Application Exploration capabilities, which constructs a model of a target application comprising components like `Page`, `Action`, `Object`, `Relationship`, and `Observation`.

We needed to decide whether to store these concepts as independent relational tables (e.g., `application_pages`, `application_actions`) or serialize the entire structured model as a JSON blob within a single `ApplicationModel` row.

## Decision
We will store the entire application definition as a serialized JSON payload (`model_data`) within a single `ApplicationModel` row. We are currently using SQLAlchemy's generic `JSON` type for schema flexibility.

## Rationale
1. **Lifecycle Binding**: The extracted elements (pages, actions, inferred objects) are fundamentally pieces of a cohesive snapshot. They do not possess independent lifecycles; they are created as a single unit during an exploration session, read as a single unit when constructing tests, and archived together.
2. **Versioning and Immutability**: Each exploration run generates a new version of the application model based on the target configuration at that specific time. Storing the state in a unified JSON structure simplifies tracking immutability and version boundaries (`exploration_version`, `model_version`).
3. **Database Complexity**: Storing these as deeply nested relational tables would demand complex joins and cascading inserts/deletes for data that is effectively treated as a single document.
4. **Fast Prototyping**: Structured JSON (validated in the application layer via Pydantic) allows rapid schema evolution for AI observations without requiring database migrations for every new AI inference capability.

## When Should We Change This?

We should revisit this decision and consider migrating components to relational tables **if and only if** any of the following conditions are met:
1. **Independent Mutability Requirements**: If we introduce a feature allowing a human operator to independently edit, augment, or link a specific subset of the model (e.g., manually verifying an `Object` and linking it to a separate product module across multiple models), relational integrity would be beneficial.
2. **Cross-Model Querying at Scale**: If we need to perform complex analytical queries across thousands of models (e.g., "Find all targets that contain an action matching X across all projects"), and `JSONB` indexing is proving inadequate or inefficient compared to standard relational indexes.
3. **Blob Size Exceeds Limits**: If the exploration payload grows so large that retrieving and deserializing the entire blob into memory just to read a single `Action` becomes a performance bottleneck.

## JSON vs JSONB Notes
We initially used SQLAlchemy's generic `JSON` type. As the product scales exclusively on PostgreSQL, we may explicitly cast this column to the `JSONB` dialect if we ever require efficient, indexable querying against the JSON keys (for example, searching for specific role capabilities deep within the payload). Until cross-document querying becomes a requirement, the generic `JSON` type remains sufficient for storage and retrieval.
