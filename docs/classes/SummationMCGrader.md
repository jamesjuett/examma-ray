[examma-ray](../README.md) / [Exports](../modules.md) / SummationMCGrader

# Class: SummationMCGrader

## Implements

- [`QuestionGrader`](../interfaces/QuestionGrader.md)<``"multiple_choice"``\>

## Table of contents

### Constructors

- [constructor](SummationMCGrader.md#constructor)

### Properties

- [pointValues](SummationMCGrader.md#pointvalues)
- [questionType](SummationMCGrader.md#questiontype)

### Methods

- [grade](SummationMCGrader.md#grade)
- [isGrader](SummationMCGrader.md#isgrader)
- [pointsEarned](SummationMCGrader.md#pointsearned)
- [prepare](SummationMCGrader.md#prepare)
- [renderOverview](SummationMCGrader.md#renderoverview)
- [renderReport](SummationMCGrader.md#renderreport)
- [renderStats](SummationMCGrader.md#renderstats)

## Constructors

### constructor

• **new SummationMCGrader**(`pointValues`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointValues` | readonly { `points`: `number` ; `selected`: `boolean`  }[] | For each answer option, define whether the grader is looking for the option to be selected or not (true/false) and the number of points to add (or subtract if negative) in that case |

#### Defined in

[graders/SummationMCGrader.ts:29](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L29)

## Properties

### pointValues

• `Readonly` **pointValues**: readonly { `points`: `number` ; `selected`: `boolean`  }[]

___

### questionType

• `Readonly` **questionType**: ``"multiple_choice"``

#### Defined in

[graders/SummationMCGrader.ts:21](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L21)

## Methods

### grade

▸ **grade**(`aq`): [`SummationMCGradingResult`](../modules.md#summationmcgradingresult)

Grades the given assigned question and returns the grading result. This function
does not itself modify the assigned question to contain the result (just returns it).

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | [`AssignedQuestion`](AssignedQuestion.md)<``"multiple_choice"``\> |

#### Returns

[`SummationMCGradingResult`](../modules.md#summationmcgradingresult)

The result of

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[grade](../interfaces/QuestionGrader.md#grade)

#### Defined in

[graders/SummationMCGrader.ts:39](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L39)

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

[graders/SummationMCGrader.ts:33](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L33)

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
| `gr` | [`SummationMCGradingResult`](../modules.md#summationmcgradingresult) |

#### Returns

`number`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[pointsEarned](../interfaces/QuestionGrader.md#pointsearned)

#### Defined in

[graders/SummationMCGrader.ts:68](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L68)

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

[graders/SummationMCGrader.ts:37](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L37)

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

[graders/SummationMCGrader.ts:98](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L98)

___

### renderReport

▸ **renderReport**(`gq`): `string`

Renders a report of how the question was graded to an HTML string.

#### Parameters

| Name | Type |
| :------ | :------ |
| `gq` | `GradedQuestion`<``"multiple_choice"``, [`SummationMCGradingResult`](../modules.md#summationmcgradingresult)\> |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderReport](../interfaces/QuestionGrader.md#renderreport)

#### Defined in

[graders/SummationMCGrader.ts:72](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L72)

___

### renderStats

▸ **renderStats**(): `string`

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderStats](../interfaces/QuestionGrader.md#renderstats)

#### Defined in

[graders/SummationMCGrader.ts:93](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L93)
