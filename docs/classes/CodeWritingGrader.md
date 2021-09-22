[examma-ray](../README.md) / [Exports](../modules.md) / CodeWritingGrader

# Class: CodeWritingGrader

## Implements

- [`QuestionGrader`](../interfaces/QuestionGrader.md)<[`ResponseKind`](../modules.md#responsekind)\>

## Table of contents

### Constructors

- [constructor](CodeWritingGrader.md#constructor)

### Properties

- [manualGrading](CodeWritingGrader.md#manualgrading)
- [manualGradingMap](CodeWritingGrader.md#manualgradingmap)
- [rubric](CodeWritingGrader.md#rubric)

### Methods

- [grade](CodeWritingGrader.md#grade)
- [isGrader](CodeWritingGrader.md#isgrader)
- [pointsEarned](CodeWritingGrader.md#pointsearned)
- [prepare](CodeWritingGrader.md#prepare)
- [renderOverview](CodeWritingGrader.md#renderoverview)
- [renderReport](CodeWritingGrader.md#renderreport)
- [renderStats](CodeWritingGrader.md#renderstats)

## Constructors

### constructor

• **new CodeWritingGrader**(`rubric`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rubric` | readonly [`CodeWritingRubricItem`](../modules.md#codewritingrubricitem)[] |

#### Defined in

[graders/CodeWritingGrader.ts:46](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L46)

## Properties

### manualGrading

• `Private` `Optional` **manualGrading**: readonly `CodeWritingGradingAssignment`[]

#### Defined in

[graders/CodeWritingGrader.ts:43](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L43)

___

### manualGradingMap

• `Private` `Optional` **manualGradingMap**: `Object`

#### Index signature

▪ [index: `string`]: [`CodeWritingGradingResult`](../modules.md#codewritinggradingresult) \| `undefined`

#### Defined in

[graders/CodeWritingGrader.ts:44](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L44)

___

### rubric

• `Readonly` **rubric**: readonly [`CodeWritingRubricItem`](../modules.md#codewritingrubricitem)[]

#### Defined in

[graders/CodeWritingGrader.ts:42](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L42)

## Methods

### grade

▸ **grade**(`aq`): `undefined` \| [`CodeWritingGradingResult`](../modules.md#codewritinggradingresult)

Grades the given assigned question and returns the grading result. This function
does not itself modify the assigned question to contain the result (just returns it).

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\> |

#### Returns

`undefined` \| [`CodeWritingGradingResult`](../modules.md#codewritinggradingresult)

The result of

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[grade](../interfaces/QuestionGrader.md#grade)

#### Defined in

[graders/CodeWritingGrader.ts:79](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L79)

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

[graders/CodeWritingGrader.ts:50](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L50)

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
| `gr` | [`CodeWritingGradingResult`](../modules.md#codewritinggradingresult) |

#### Returns

`number`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[pointsEarned](../interfaces/QuestionGrader.md#pointsearned)

#### Defined in

[graders/CodeWritingGrader.ts:93](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L93)

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

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[prepare](../interfaces/QuestionGrader.md#prepare)

#### Defined in

[graders/CodeWritingGrader.ts:54](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L54)

___

### renderOverview

▸ **renderOverview**(): `string`

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderOverview](../interfaces/QuestionGrader.md#renderoverview)

#### Defined in

[graders/CodeWritingGrader.ts:203](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L203)

___

### renderReport

▸ **renderReport**(`aq`): `string`

Renders a report of how the question was graded to an HTML string.

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | `GradedQuestion`<[`ResponseKind`](../modules.md#responsekind), [`CodeWritingGradingResult`](../modules.md#codewritinggradingresult)\> |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderReport](../interfaces/QuestionGrader.md#renderreport)

#### Defined in

[graders/CodeWritingGrader.ts:97](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L97)

___

### renderStats

▸ **renderStats**(): `string`

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderStats](../interfaces/QuestionGrader.md#renderstats)

#### Defined in

[graders/CodeWritingGrader.ts:199](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L199)
