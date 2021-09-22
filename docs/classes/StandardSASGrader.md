[examma-ray](../README.md) / [Exports](../modules.md) / StandardSASGrader

# Class: StandardSASGrader

## Implements

- [`QuestionGrader`](../interfaces/QuestionGrader.md)<``"select_a_statement"``\>

## Table of contents

### Constructors

- [constructor](StandardSASGrader.md#constructor)

### Properties

- [rubric](StandardSASGrader.md#rubric)

### Methods

- [grade](StandardSASGrader.md#grade)
- [isGrader](StandardSASGrader.md#isgrader)
- [pointsEarned](StandardSASGrader.md#pointsearned)
- [prepare](StandardSASGrader.md#prepare)
- [renderOverview](StandardSASGrader.md#renderoverview)
- [renderReport](StandardSASGrader.md#renderreport)
- [renderStats](StandardSASGrader.md#renderstats)

## Constructors

### constructor

• **new StandardSASGrader**(`rubric`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rubric` | readonly `SASRubricItem`[] |

#### Defined in

[graders/StandardSASGrader.ts:37](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/StandardSASGrader.ts#L37)

## Properties

### rubric

• `Readonly` **rubric**: readonly `SASRubricItem`[]

## Methods

### grade

▸ **grade**(`aq`): `StandardSASGradingResult`

Grades the given assigned question and returns the grading result. This function
does not itself modify the assigned question to contain the result (just returns it).

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | [`AssignedQuestion`](AssignedQuestion.md)<``"select_a_statement"``\> |

#### Returns

`StandardSASGradingResult`

The result of

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[grade](../interfaces/QuestionGrader.md#grade)

#### Defined in

[graders/StandardSASGrader.ts:47](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/StandardSASGrader.ts#L47)

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

[graders/StandardSASGrader.ts:41](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/StandardSASGrader.ts#L41)

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
| `gr` | `StandardSASGradingResult` |

#### Returns

`number`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[pointsEarned](../interfaces/QuestionGrader.md#pointsearned)

#### Defined in

[graders/StandardSASGrader.ts:66](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/StandardSASGrader.ts#L66)

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

[graders/StandardSASGrader.ts:45](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/StandardSASGrader.ts#L45)

___

### renderOverview

▸ **renderOverview**(): `string`

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderOverview](../interfaces/QuestionGrader.md#renderoverview)

#### Defined in

[graders/StandardSASGrader.ts:140](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/StandardSASGrader.ts#L140)

___

### renderReport

▸ **renderReport**(`aq`): `string`

Renders a report of how the question was graded to an HTML string.

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | `GradedQuestion`<``"select_a_statement"``, `StandardSASGradingResult`\> |

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderReport](../interfaces/QuestionGrader.md#renderreport)

#### Defined in

[graders/StandardSASGrader.ts:70](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/StandardSASGrader.ts#L70)

___

### renderStats

▸ **renderStats**(): `string`

#### Returns

`string`

#### Implementation of

[QuestionGrader](../interfaces/QuestionGrader.md).[renderStats](../interfaces/QuestionGrader.md#renderstats)

#### Defined in

[graders/StandardSASGrader.ts:136](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/StandardSASGrader.ts#L136)
