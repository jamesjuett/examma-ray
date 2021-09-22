[examma-ray](../README.md) / [Exports](../modules.md) / ExamUtils

# Namespace: ExamUtils

## Table of contents

### Functions

- [clearGradingAssignments](ExamUtils.md#cleargradingassignments)
- [createGradingAssignments](ExamUtils.md#creategradingassignments)
- [gradingAssignmentDir](ExamUtils.md#gradingassignmentdir)
- [loadCSVRoster](ExamUtils.md#loadcsvroster)
- [loadExamAnswers](ExamUtils.md#loadexamanswers)
- [loadTrustedSubmission](ExamUtils.md#loadtrustedsubmission)
- [loadTrustedSubmissions](ExamUtils.md#loadtrustedsubmissions)
- [readGradingAssignments](ExamUtils.md#readgradingassignments)
- [rechunkGradingAssignments](ExamUtils.md#rechunkgradingassignments)
- [writeGradingAssignments](ExamUtils.md#writegradingassignments)

## Functions

### clearGradingAssignments

▸ **clearGradingAssignments**(`exam_id`, `question_id`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `exam_id` | `string` |
| `question_id` | `string` |

#### Returns

`void`

#### Defined in

[ExamUtils.ts:143](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L143)

___

### createGradingAssignments

▸ **createGradingAssignments**(`aqs`, `numChunks`): [`GradingAssignmentSpecification`](../modules.md#gradingassignmentspecification)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `aqs` | readonly [`AssignedQuestion`](../classes/AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[] |
| `numChunks` | `number` |

#### Returns

[`GradingAssignmentSpecification`](../modules.md#gradingassignmentspecification)[]

#### Defined in

[ExamUtils.ts:83](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L83)

___

### gradingAssignmentDir

▸ **gradingAssignmentDir**(`exam_id`, `question_id`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `exam_id` | `string` |
| `question_id` | `string` |

#### Returns

`string`

#### Defined in

[ExamUtils.ts:128](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L128)

___

### loadCSVRoster

▸ **loadCSVRoster**(`filename`): [`StudentInfo`](../interfaces/StudentInfo.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `filename` | `string` |

#### Returns

[`StudentInfo`](../interfaces/StudentInfo.md)[]

#### Defined in

[ExamUtils.ts:68](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L68)

___

### loadExamAnswers

▸ **loadExamAnswers**(`filename`): [`ExamSubmission`](../modules.md#examsubmission)

#### Parameters

| Name | Type |
| :------ | :------ |
| `filename` | `string` |

#### Returns

[`ExamSubmission`](../modules.md#examsubmission)

#### Defined in

[ExamUtils.ts:19](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L19)

___

### loadTrustedSubmission

▸ **loadTrustedSubmission**(`manifestDirectory`, `submittedFilename`): [`TrustedExamSubmission`](../modules.md#trustedexamsubmission)

#### Parameters

| Name | Type |
| :------ | :------ |
| `manifestDirectory` | `string` |
| `submittedFilename` | `string` |

#### Returns

[`TrustedExamSubmission`](../modules.md#trustedexamsubmission)

#### Defined in

[ExamUtils.ts:23](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L23)

___

### loadTrustedSubmissions

▸ **loadTrustedSubmissions**(`manifestDirectory`, `submittedDirectory`, `trustedCacheDirectory?`): [`TrustedExamSubmission`](../modules.md#trustedexamsubmission)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `manifestDirectory` | `string` |
| `submittedDirectory` | `string` |
| `trustedCacheDirectory?` | `string` |

#### Returns

[`TrustedExamSubmission`](../modules.md#trustedexamsubmission)[]

#### Defined in

[ExamUtils.ts:32](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L32)

___

### readGradingAssignments

▸ **readGradingAssignments**(`exam_id`, `question_id`): [`GradingAssignmentSpecification`](../modules.md#gradingassignmentspecification)<[`ResponseKind`](../modules.md#responsekind), `GradingResult`\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `exam_id` | `string` |
| `question_id` | `string` |

#### Returns

[`GradingAssignmentSpecification`](../modules.md#gradingassignmentspecification)<[`ResponseKind`](../modules.md#responsekind), `GradingResult`\>[]

#### Defined in

[ExamUtils.ts:132](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L132)

___

### rechunkGradingAssignments

▸ **rechunkGradingAssignments**(`assns`, `numChunks`): [`GradingAssignmentSpecification`](../modules.md#gradingassignmentspecification)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `assns` | [`GradingAssignmentSpecification`](../modules.md#gradingassignmentspecification)<[`ResponseKind`](../modules.md#responsekind), `GradingResult`\>[] |
| `numChunks` | `number` |

#### Returns

[`GradingAssignmentSpecification`](../modules.md#gradingassignmentspecification)[]

#### Defined in

[ExamUtils.ts:107](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L107)

___

### writeGradingAssignments

▸ **writeGradingAssignments**(`assns`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `assns` | [`GradingAssignmentSpecification`](../modules.md#gradingassignmentspecification)<[`ResponseKind`](../modules.md#responsekind), `GradingResult`\>[] |

#### Returns

`void`

#### Defined in

[ExamUtils.ts:147](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamUtils.ts#L147)
