[examma-ray](../README.md) / [Exports](../modules.md) / FITBRegexGrader

# Class: FITBRegexGrader

## Implements

- [`QuestionGrader`](../interfaces/QuestionGrader.md)<``"fitb"``\>

## Table of contents

### Constructors

- [constructor](FITBRegexGrader.md#constructor)

### Properties

- [minRubricItemPoints](FITBRegexGrader.md#minrubricitempoints)
- [rubric](FITBRegexGrader.md#rubric)

### Methods

- [getGradedBlanksSubmissions](FITBRegexGrader.md#getgradedblankssubmissions)
- [grade](FITBRegexGrader.md#grade)
- [grade_helper](FITBRegexGrader.md#grade_helper)
- [isGrader](FITBRegexGrader.md#isgrader)
- [pointsEarned](FITBRegexGrader.md#pointsearned)
- [prepare](FITBRegexGrader.md#prepare)
- [renderOverview](FITBRegexGrader.md#renderoverview)
- [renderReport](FITBRegexGrader.md#renderreport)
- [renderStats](FITBRegexGrader.md#renderstats)

## Constructors

### constructor

• **new FITBRegexGrader**(`rubric`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rubric` | readonly [`FITBRegexRubricItem`](../modules.md#fitbregexrubricitem)[] |

#### Defined in

[graders/FITBRegexGrader.ts:49](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L49)

## Properties

### minRubricItemPoints

• `Private` **minRubricItemPoints**: `number`

#### Defined in

[graders/FITBRegexGrader.ts:47](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L47)

___

### rubric

• `Readonly` **rubric**: readonly [`FITBRegexRubricItem`](../modules.md#fitbregexrubricitem)[]

## Methods

### getGradedBlanksSubmissions

▸ `Private` **getGradedBlanksSubmissions**(`submissions`): { `num`: `number` ; `points`: `number` ; `sub`: `string`  }[][]

#### Parameters

| Name | Type |
| :------ | :------ |
| `submissions` | readonly [`FITBSubmission`](../modules.md#fitbsubmission)[] |

#### Returns

{ `num`: `number` ; `points`: `number` ; `sub`: `string`  }[][]

#### Defined in

[graders/FITBRegexGrader.ts:205](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L205)

___

### grade

▸ **grade**(`aq`): [`FITBRegexGradingResult`](../modules.md#fitbregexgradingresult)

Grades the given assigned question and returns the grading result. This function
does not itself modify the assigned question to contain the result (just returns it).

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | [`AssignedQuestion`](AssignedQuestion.md)<``"fitb"``\> |

#### Returns

[`FITBRegexGradingResult`](../modules.md#fitbregexgradingresult)

The result of

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[grade](../interfaces/QuestionGrader.md#grade)

#### Defined in

[graders/FITBRegexGrader.ts:62](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L62)

___

### grade\_helper

▸ `Private` **grade_helper**(`submission`): [`FITBRegexGradingResult`](../modules.md#fitbregexgradingresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `submission` | readonly `string`[] |

#### Returns

[`FITBRegexGradingResult`](../modules.md#fitbregexgradingresult)

#### Defined in

[graders/FITBRegexGrader.ts:96](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L96)

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

[graders/FITBRegexGrader.ts:56](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L56)

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
| `gr` | [`FITBRegexGradingResult`](../modules.md#fitbregexgradingresult) |

#### Returns

`number`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[pointsEarned](../interfaces/QuestionGrader.md#pointsearned)

#### Defined in

[graders/FITBRegexGrader.ts:116](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L116)

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

[graders/FITBRegexGrader.ts:60](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L60)

___

### renderOverview

▸ **renderOverview**(`gqs`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `gqs` | readonly `GradedQuestion`<``"fitb"``, `GradingResult`\>[] |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderOverview](../interfaces/QuestionGrader.md#renderoverview)

#### Defined in

[graders/FITBRegexGrader.ts:234](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L234)

___

### renderReport

▸ **renderReport**(`aq`): `string`

Renders a report of how the question was graded to an HTML string.

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | `GradedQuestion`<``"fitb"``, [`FITBRegexGradingResult`](../modules.md#fitbregexgradingresult)\> |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderReport](../interfaces/QuestionGrader.md#renderreport)

#### Defined in

[graders/FITBRegexGrader.ts:120](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L120)

___

### renderStats

▸ **renderStats**(`aqs`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aqs` | readonly [`AssignedQuestion`](AssignedQuestion.md)<``"fitb"``\>[] |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderStats](../interfaces/QuestionGrader.md#renderstats)

#### Defined in

[graders/FITBRegexGrader.ts:178](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L178)
