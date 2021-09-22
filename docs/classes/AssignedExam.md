[examma-ray](../README.md) / [Exports](../modules.md) / AssignedExam

# Class: AssignedExam

## Table of contents

### Constructors

- [constructor](AssignedExam.md#constructor)

### Properties

- [_isFullyGraded](AssignedExam.md#_isfullygraded)
- [assignedQuestionById](AssignedExam.md#assignedquestionbyid)
- [assignedQuestions](AssignedExam.md#assignedquestions)
- [assignedSections](AssignedExam.md#assignedsections)
- [curve](AssignedExam.md#curve)
- [exam](AssignedExam.md#exam)
- [pointsEarned](AssignedExam.md#pointsearned)
- [pointsPossible](AssignedExam.md#pointspossible)
- [student](AssignedExam.md#student)
- [uuid](AssignedExam.md#uuid)

### Methods

- [applyCurve](AssignedExam.md#applycurve)
- [createManifest](AssignedExam.md#createmanifest)
- [getAssignedQuestionById](AssignedExam.md#getassignedquestionbyid)
- [gradeAll](AssignedExam.md#gradeall)
- [isGraded](AssignedExam.md#isgraded)
- [renderAll](AssignedExam.md#renderall)
- [renderBody](AssignedExam.md#renderbody)
- [renderGrade](AssignedExam.md#rendergrade)
- [renderGradingSummary](AssignedExam.md#rendergradingsummary)
- [renderNav](AssignedExam.md#rendernav)
- [renderSaverButton](AssignedExam.md#rendersaverbutton)
- [renderTimer](AssignedExam.md#rendertimer)

## Constructors

### constructor

• **new AssignedExam**(`uuid`, `exam`, `student`, `assignedSections`, `allowDuplicates`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `uuid` | `string` |
| `exam` | [`Exam`](Exam.md) |
| `student` | [`StudentInfo`](../interfaces/StudentInfo.md) |
| `assignedSections` | readonly [`AssignedSection`](AssignedSection.md)[] |
| `allowDuplicates` | `boolean` |

#### Defined in

[exams.ts:437](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L437)

## Properties

### \_isFullyGraded

• `Private` **\_isFullyGraded**: `boolean` = `false`

#### Defined in

[exams.ts:426](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L426)

___

### assignedQuestionById

• `Private` **assignedQuestionById**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: [`AssignedQuestion`](AssignedQuestion.md) \| `undefined`

#### Defined in

[exams.ts:430](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L430)

___

### assignedQuestions

• `Readonly` **assignedQuestions**: readonly [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[]

#### Defined in

[exams.ts:435](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L435)

___

### assignedSections

• `Readonly` **assignedSections**: readonly [`AssignedSection`](AssignedSection.md)[]

#### Defined in

[exams.ts:434](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L434)

___

### curve

• `Optional` `Readonly` **curve**: `AppliedCurve`

#### Defined in

[exams.ts:428](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L428)

___

### exam

• `Readonly` **exam**: [`Exam`](Exam.md)

#### Defined in

[exams.ts:421](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L421)

___

### pointsEarned

• `Optional` `Readonly` **pointsEarned**: `number`

#### Defined in

[exams.ts:425](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L425)

___

### pointsPossible

• `Readonly` **pointsPossible**: `number`

#### Defined in

[exams.ts:424](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L424)

___

### student

• `Readonly` **student**: [`StudentInfo`](../interfaces/StudentInfo.md)

#### Defined in

[exams.ts:422](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L422)

___

### uuid

• `Readonly` **uuid**: `string`

#### Defined in

[exams.ts:420](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L420)

## Methods

### applyCurve

▸ **applyCurve**(`curve`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `curve` | `ExamCurve` |

#### Returns

`void`

#### Defined in

[exams.ts:477](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L477)

___

### createManifest

▸ **createManifest**(): [`TrustedExamSubmission`](../modules.md#trustedexamsubmission)

#### Returns

[`TrustedExamSubmission`](../modules.md#trustedexamsubmission)

#### Defined in

[exams.ts:588](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L588)

___

### getAssignedQuestionById

▸ **getAssignedQuestionById**(`question_id`): `undefined` \| [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `question_id` | `string` |

#### Returns

`undefined` \| [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>

#### Defined in

[exams.ts:462](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L462)

___

### gradeAll

▸ **gradeAll**(`graders`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `graders` | [`GraderMap`](../modules.md#gradermap) |

#### Returns

`void`

#### Defined in

[exams.ts:466](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L466)

___

### isGraded

▸ **isGraded**(): this is GradedExam

#### Returns

this is GradedExam

#### Defined in

[exams.ts:473](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L473)

___

### renderAll

▸ **renderAll**(`mode`, `frontendPath`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode` | `RenderMode` |
| `frontendPath` | `string` |

#### Returns

`string`

#### Defined in

[exams.ts:568](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L568)

___

### renderBody

▸ **renderBody**(`mode`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode` | `RenderMode` |

#### Returns

`string`

#### Defined in

[exams.ts:543](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L543)

___

### renderGrade

▸ **renderGrade**(): `string`

#### Returns

`string`

#### Defined in

[exams.ts:481](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L481)

___

### renderGradingSummary

▸ **renderGradingSummary**(): `string`

#### Returns

`string`

#### Defined in

[exams.ts:530](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L530)

___

### renderNav

▸ **renderNav**(`mode`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode` | `RenderMode` |

#### Returns

`string`

#### Defined in

[exams.ts:487](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L487)

___

### renderSaverButton

▸ **renderSaverButton**(): `string`

#### Returns

`string`

#### Defined in

[exams.ts:500](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L500)

___

### renderTimer

▸ **renderTimer**(`mode`): ``""`` \| ``"\n        <div class=\"text-center pb-1 border-bottom\">\n          <button id=\"examma-ray-time-elapsed-button\" class=\"btn btn-primary btn-sm\" style=\"line-height: 0.75;\" data-toggle=\"collapse\" data-target=\"#examma-ray-time-elapsed\" aria-expanded=\"true\" aria-controls=\"examma-ray-time-elapsed\">Hide</button>\n          <b>Time Elapsed</b>\n          <br>\n          <b><span class=\"collapse show\" id=\"examma-ray-time-elapsed\">?</span></b>\n          <br>\n          This is not an official timer. Please submit your answers file before the deadline.\n        </div>\n      "``

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode` | `RenderMode` |

#### Returns

``""`` \| ``"\n        <div class=\"text-center pb-1 border-bottom\">\n          <button id=\"examma-ray-time-elapsed-button\" class=\"btn btn-primary btn-sm\" style=\"line-height: 0.75;\" data-toggle=\"collapse\" data-target=\"#examma-ray-time-elapsed\" aria-expanded=\"true\" aria-controls=\"examma-ray-time-elapsed\">Hide</button>\n          <b>Time Elapsed</b>\n          <br>\n          <b><span class=\"collapse show\" id=\"examma-ray-time-elapsed\">?</span></b>\n          <br>\n          This is not an official timer. Please submit your answers file before the deadline.\n        </div>\n      "``

#### Defined in

[exams.ts:512](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L512)
