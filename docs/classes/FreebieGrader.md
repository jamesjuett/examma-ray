[examma-ray](../README.md) / [Exports](../modules.md) / FreebieGrader

# Class: FreebieGrader

A grader that gives points to all submissions. Whether or not blank
submissions earn points can be configured.

**`template`** May be any response type

## Implements

- [`QuestionGrader`](../interfaces/QuestionGrader.md)<[`ResponseKind`](../modules.md#responsekind)\>

## Table of contents

### Constructors

- [constructor](FreebieGrader.md#constructor)

### Properties

- [blankAllowed](FreebieGrader.md#blankallowed)
- [pointValue](FreebieGrader.md#pointvalue)

### Methods

- [grade](FreebieGrader.md#grade)
- [isGrader](FreebieGrader.md#isgrader)
- [pointsEarned](FreebieGrader.md#pointsearned)
- [prepare](FreebieGrader.md#prepare)
- [renderOverview](FreebieGrader.md#renderoverview)
- [renderReport](FreebieGrader.md#renderreport)
- [renderStats](FreebieGrader.md#renderstats)

## Constructors

### constructor

• **new FreebieGrader**(`pointValue`, `blankAllowed?`)

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `pointValue` | `number` | `undefined` | How many points are awarded to submissions. |
| `blankAllowed` | `boolean` | `false` | Whether or not blank submissions earn points. |

#### Defined in

[graders/FreebieGrader.ts:20](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FreebieGrader.ts#L20)

## Properties

### blankAllowed

• `Readonly` **blankAllowed**: `boolean` = `false`

___

### pointValue

• `Readonly` **pointValue**: `number`

## Methods

### grade

▸ **grade**(`aq`): `ImmutableGradingResult`

Grades the given assigned question and returns the grading result. This function
does not itself modify the assigned question to contain the result (just returns it).

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\> |

#### Returns

`ImmutableGradingResult`

The result of

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[grade](../interfaces/QuestionGrader.md#grade)

#### Defined in

[graders/FreebieGrader.ts:31](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FreebieGrader.ts#L31)

___

### isGrader

▸ **isGrader**<`T`\>(`responseKind`): this is QuestionGrader<T, GradingResult\>

Returns whether or not this grader can be used for the given response kind

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`ResponseKind`](../modules.md#responsekind) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `responseKind` | `T` |

#### Returns

this is QuestionGrader<T, GradingResult\>

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[isGrader](../interfaces/QuestionGrader.md#isgrader)

#### Defined in

[graders/FreebieGrader.ts:25](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FreebieGrader.ts#L25)

___

### pointsEarned

▸ **pointsEarned**(`gr`): `number`

Computes the number of points earned for the given graded question.
Heads up! This could be negative or more than the number of points
a question is worth, depending on the type of grader. That's not the
concern of the grader, and it's your decision on how to handle it elsewhere
(e.g. by clamping the value between 0 and max points possible on a question).

#### Parameters

| Name | Type |
| :------ | :------ |
| `gr` | `ImmutableGradingResult` |

#### Returns

`number`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[pointsEarned](../interfaces/QuestionGrader.md#pointsearned)

#### Defined in

[graders/FreebieGrader.ts:38](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FreebieGrader.ts#L38)

___

### prepare

▸ **prepare**(): `void`

Gives the grader a chance to do any one-time preparation depending on
the exam and question it is being used for. For example, a manually graded
question may prepare by loading its grading result data from files.

#### Returns

`void`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[prepare](../interfaces/QuestionGrader.md#prepare)

#### Defined in

[graders/FreebieGrader.ts:29](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FreebieGrader.ts#L29)

___

### renderOverview

▸ **renderOverview**(`gqs`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `gqs` | readonly `GradedQuestion`<``"multiple_choice"``, `GradingResult`\>[] |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderOverview](../interfaces/QuestionGrader.md#renderoverview)

#### Defined in

[graders/FreebieGrader.ts:55](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FreebieGrader.ts#L55)

___

### renderReport

▸ **renderReport**(`aq`): `string`

Renders a report of how the question was graded to an HTML string.

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | `GradedQuestion`<[`ResponseKind`](../modules.md#responsekind), `ImmutableGradingResult`\> |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderReport](../interfaces/QuestionGrader.md#renderreport)

#### Defined in

[graders/FreebieGrader.ts:42](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FreebieGrader.ts#L42)

___

### renderStats

▸ **renderStats**(`aqs`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aqs` | readonly [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[] |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderStats](../interfaces/QuestionGrader.md#renderstats)

#### Defined in

[graders/FreebieGrader.ts:51](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FreebieGrader.ts#L51)
