[examma-ray](../README.md) / [Exports](../modules.md) / SimpleMCGrader

# Class: SimpleMCGrader

## Implements

- [`QuestionGrader`](../interfaces/QuestionGrader.md)<``"multiple_choice"``, [`SimpleMCGradingResult`](../modules.md#simplemcgradingresult)\>

## Table of contents

### Constructors

- [constructor](SimpleMCGrader.md#constructor)

### Properties

- [correctIndex](SimpleMCGrader.md#correctindex)

### Methods

- [grade](SimpleMCGrader.md#grade)
- [isGrader](SimpleMCGrader.md#isgrader)
- [pointsEarned](SimpleMCGrader.md#pointsearned)
- [prepare](SimpleMCGrader.md#prepare)
- [renderOverview](SimpleMCGrader.md#renderoverview)
- [renderReport](SimpleMCGrader.md#renderreport)
- [renderStats](SimpleMCGrader.md#renderstats)

## Constructors

### constructor

• **new SimpleMCGrader**(`correctIndex`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `correctIndex` | `number` | 0-based index of correct answer. |

#### Defined in

[graders/SimpleMCGrader.ts:26](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SimpleMCGrader.ts#L26)

## Properties

### correctIndex

• `Readonly` **correctIndex**: `number`

## Methods

### grade

▸ **grade**(`aq`): [`SimpleMCGradingResult`](../modules.md#simplemcgradingresult)

Grades the given assigned question and returns the grading result. This function
does not itself modify the assigned question to contain the result (just returns it).

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | [`AssignedQuestion`](AssignedQuestion.md)<``"multiple_choice"``\> |

#### Returns

[`SimpleMCGradingResult`](../modules.md#simplemcgradingresult)

The result of

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[grade](../interfaces/QuestionGrader.md#grade)

#### Defined in

[graders/SimpleMCGrader.ts:36](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SimpleMCGrader.ts#L36)

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

[graders/SimpleMCGrader.ts:30](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SimpleMCGrader.ts#L30)

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
| `gr` | [`SimpleMCGradingResult`](../modules.md#simplemcgradingresult) |

#### Returns

`number`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[pointsEarned](../interfaces/QuestionGrader.md#pointsearned)

#### Defined in

[graders/SimpleMCGrader.ts:58](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SimpleMCGrader.ts#L58)

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

[graders/SimpleMCGrader.ts:34](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SimpleMCGrader.ts#L34)

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

[graders/SimpleMCGrader.ts:90](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SimpleMCGrader.ts#L90)

___

### renderReport

▸ **renderReport**(`aq`): `string`

Renders a report of how the question was graded to an HTML string.

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | `GradedQuestion`<``"multiple_choice"``, [`SimpleMCGradingResult`](../modules.md#simplemcgradingresult)\> |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderReport](../interfaces/QuestionGrader.md#renderreport)

#### Defined in

[graders/SimpleMCGrader.ts:62](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SimpleMCGrader.ts#L62)

___

### renderStats

▸ **renderStats**(): `string`

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderStats](../interfaces/QuestionGrader.md#renderstats)

#### Defined in

[graders/SimpleMCGrader.ts:86](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SimpleMCGrader.ts#L86)
