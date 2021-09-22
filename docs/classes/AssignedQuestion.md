[examma-ray](../README.md) / [Exports](../modules.md) / AssignedQuestion

# Class: AssignedQuestion<QT\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `QT` | extends [`ResponseKind`](../modules.md#responsekind)[`ResponseKind`](../modules.md#responsekind) |

## Table of contents

### Constructors

- [constructor](AssignedQuestion.md#constructor)

### Properties

- [displayIndex](AssignedQuestion.md#displayindex)
- [exam](AssignedQuestion.md#exam)
- [exception](AssignedQuestion.md#exception)
- [gradedBy](AssignedQuestion.md#gradedby)
- [gradingResult](AssignedQuestion.md#gradingresult)
- [html_description](AssignedQuestion.md#html_description)
- [partIndex](AssignedQuestion.md#partindex)
- [question](AssignedQuestion.md#question)
- [rawSubmission](AssignedQuestion.md#rawsubmission)
- [sectionIndex](AssignedQuestion.md#sectionindex)
- [skin](AssignedQuestion.md#skin)
- [student](AssignedQuestion.md#student)
- [submission](AssignedQuestion.md#submission)
- [uuid](AssignedQuestion.md#uuid)

### Accessors

- [pointsEarned](AssignedQuestion.md#pointsearned)
- [pointsEarnedWithoutExceptions](AssignedQuestion.md#pointsearnedwithoutexceptions)

### Methods

- [addException](AssignedQuestion.md#addexception)
- [grade](AssignedQuestion.md#grade)
- [isGraded](AssignedQuestion.md#isgraded)
- [render](AssignedQuestion.md#render)
- [renderExceptionIfPresent](AssignedQuestion.md#renderexceptionifpresent)
- [wasGradedBy](AssignedQuestion.md#wasgradedby)

## Constructors

### constructor

• **new AssignedQuestion**<`QT`\>(`uuid`, `exam`, `student`, `question`, `skin`, `sectionIndex`, `partIndex`, `rawSubmission`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `QT` | extends [`ResponseKind`](../modules.md#responsekind)[`ResponseKind`](../modules.md#responsekind) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `uuid` | `string` |
| `exam` | [`Exam`](Exam.md) |
| `student` | [`StudentInfo`](../interfaces/StudentInfo.md) |
| `question` | [`Question`](Question.md)<`QT`\> |
| `skin` | [`QuestionSkin`](../modules.md#questionskin) |
| `sectionIndex` | `number` |
| `partIndex` | `number` |
| `rawSubmission` | `string` |

#### Defined in

[exams.ts:87](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L87)

## Properties

### displayIndex

• `Readonly` **displayIndex**: `string`

#### Defined in

[exams.ts:83](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L83)

___

### exam

• `Readonly` **exam**: [`Exam`](Exam.md)

___

### exception

• `Optional` `Readonly` **exception**: [`Exception`](../modules.md#exception)

#### Defined in

[exams.ts:79](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L79)

___

### gradedBy

• `Optional` `Readonly` **gradedBy**: [`QuestionGrader`](../interfaces/QuestionGrader.md)<`QT`, `GradingResult`\>

#### Defined in

[exams.ts:77](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L77)

___

### gradingResult

• `Optional` `Readonly` **gradingResult**: `GradingResult`

#### Defined in

[exams.ts:78](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L78)

___

### html\_description

• `Private` `Readonly` **html\_description**: `string`

#### Defined in

[exams.ts:85](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L85)

___

### partIndex

• `Readonly` **partIndex**: `number`

___

### question

• `Readonly` **question**: [`Question`](Question.md)<`QT`\>

___

### rawSubmission

• `Readonly` **rawSubmission**: `string`

___

### sectionIndex

• `Readonly` **sectionIndex**: `number`

___

### skin

• `Readonly` **skin**: [`QuestionSkin`](../modules.md#questionskin)

___

### student

• `Readonly` **student**: [`StudentInfo`](../interfaces/StudentInfo.md)

___

### submission

• `Readonly` **submission**: [`SubmissionType`](../modules.md#submissiontype)<`QT`\>

#### Defined in

[exams.ts:81](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L81)

___

### uuid

• `Readonly` **uuid**: `string`

## Accessors

### pointsEarned

• `get` **pointsEarned**(): `undefined` \| `number`

#### Returns

`undefined` \| `number`

#### Defined in

[exams.ts:114](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L114)

___

### pointsEarnedWithoutExceptions

• `get` **pointsEarnedWithoutExceptions**(): `undefined` \| `number`

#### Returns

`undefined` \| `number`

#### Defined in

[exams.ts:122](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L122)

## Methods

### addException

▸ **addException**(`exception`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `exception` | [`Exception`](../modules.md#exception) |

#### Returns

`void`

#### Defined in

[exams.ts:110](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L110)

___

### grade

▸ **grade**(`grader`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `grader` | [`QuestionGrader`](../interfaces/QuestionGrader.md)<`QT`, `GradingResult`\> |

#### Returns

`void`

#### Defined in

[exams.ts:103](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L103)

___

### isGraded

▸ **isGraded**(): this is GradedQuestion<QT, GradingResult\>

#### Returns

this is GradedQuestion<QT, GradingResult\>

#### Defined in

[exams.ts:213](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L213)

___

### render

▸ **render**(`mode`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode` | `RenderMode` |

#### Returns

`string`

#### Defined in

[exams.ts:128](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L128)

___

### renderExceptionIfPresent

▸ `Private` **renderExceptionIfPresent**(): `string`

#### Returns

`string`

#### Defined in

[exams.ts:201](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L201)

___

### wasGradedBy

▸ **wasGradedBy**<`GR`\>(`grader`): this is GradedQuestion<QT, GR\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `GR` | extends `GradingResult` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `grader` | [`QuestionGrader`](../interfaces/QuestionGrader.md)<`QT`, `GR`\> |

#### Returns

this is GradedQuestion<QT, GR\>

#### Defined in

[exams.ts:217](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L217)
