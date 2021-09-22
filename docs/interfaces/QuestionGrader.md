[examma-ray](../README.md) / [Exports](../modules.md) / QuestionGrader

# Interface: QuestionGrader<RK, GR\>

An interface for question graders. A grader itself defines the grading process,
and may be instantiated e.g. with a particular rubric. A grader is immutable
during the grading process and calls to each of the functions are idempotent. In
other words, a grader does not "remember" the questions it grades.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `RK` | extends [`ResponseKind`](../modules.md#responsekind)[`ResponseKind`](../modules.md#responsekind) | The kind(s) of responses this grader can grade |
| `GR` | extends `GradingResult``GradingResult` | Representation of a grading result from this kind of grader |

## Implemented by

- [`CodeWritingGrader`](../classes/CodeWritingGrader.md)
- [`FITBRegexGrader`](../classes/FITBRegexGrader.md)
- [`FreebieGrader`](../classes/FreebieGrader.md)
- [`SimpleMCGrader`](../classes/SimpleMCGrader.md)
- [`StandardSASGrader`](../classes/StandardSASGrader.md)
- [`SummationMCGrader`](../classes/SummationMCGrader.md)

## Table of contents

### Methods

- [grade](QuestionGrader.md#grade)
- [isGrader](QuestionGrader.md#isgrader)
- [pointsEarned](QuestionGrader.md#pointsearned)
- [prepare](QuestionGrader.md#prepare)
- [renderOverview](QuestionGrader.md#renderoverview)
- [renderReport](QuestionGrader.md#renderreport)
- [renderStats](QuestionGrader.md#renderstats)

## Methods

### grade

▸ **grade**(`aq`): `undefined` \| `GR`

Grades the given assigned question and returns the grading result. This function
does not itself modify the assigned question to contain the result (just returns it).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `aq` | [`AssignedQuestion`](../classes/AssignedQuestion.md)<`RK`\> | The assigned question to grade |

#### Returns

`undefined` \| `GR`

The result of

#### Defined in

[QuestionGrader.ts:40](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionGrader.ts#L40)

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

#### Defined in

[QuestionGrader.ts:23](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionGrader.ts#L23)

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
| `gr` | `GR` |

#### Returns

`number`

#### Defined in

[QuestionGrader.ts:50](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionGrader.ts#L50)

___

### prepare

▸ **prepare**(`exam_id`, `question_id`): `void`

Gives the grader a chance to do any one-time preparation depending on
the exam and question it is being used for. For example, a manually graded
question may prepare by loading its grading result data from files.

#### Parameters

| Name | Type |
| :------ | :------ |
| `exam_id` | `string` |
| `question_id` | `string` |

#### Returns

`void`

#### Defined in

[QuestionGrader.ts:32](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionGrader.ts#L32)

___

### renderOverview

▸ **renderOverview**(`gqs`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `gqs` | readonly `GradedQuestion`<`RK`, `GradingResult`\>[] |

#### Returns

`string`

#### Defined in

[QuestionGrader.ts:60](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionGrader.ts#L60)

___

### renderReport

▸ **renderReport**(`gq`): `string`

Renders a report of how the question was graded to an HTML string.

#### Parameters

| Name | Type |
| :------ | :------ |
| `gq` | `GradedQuestion`<`RK`, `GR`\> |

#### Returns

`string`

#### Defined in

[QuestionGrader.ts:56](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionGrader.ts#L56)

___

### renderStats

▸ **renderStats**(`aqs`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aqs` | readonly [`AssignedQuestion`](../classes/AssignedQuestion.md)<`RK`\>[] |

#### Returns

`string`

#### Defined in

[QuestionGrader.ts:59](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionGrader.ts#L59)
