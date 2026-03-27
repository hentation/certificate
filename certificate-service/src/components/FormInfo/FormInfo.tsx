// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { InputText } from 'urfu-ui-kit-react';
import styles from './FormInfo.styles.module.less'
// import { useEditContactsMutation, useGetContactsQuery } from '~/http/Application';
// import { PhoneInput } from '../PhoneInput/PhoneInput';
// import { useEffect, useRef, useState } from 'react';
// import { debounce } from '~/helpers/debounce';
// import { useNotificationService } from '~/hooks/notificationService';
import { Status } from '../Status/Status';
import type { Application, ApplicationById } from '~/models/application';

export const FormInfo = ({data}: {data: Application | ApplicationById}) => {

  // const {data: phoneNumber, isLoading: isLoadingPhone} = useGetContactsQuery();
  // const [editNumber] = useEditContactsMutation();

  // const { showMessage } = useNotificationService();

  // const [phone, setPhone] = useState('+7 ');

  // const debouncedSave = useRef(
  //   debounce(async (number: string) => {
  //     try {
  //       const cleaned = number.replace(/\D/g, '');
  //       if (cleaned.length === 11) {
  //         await editNumber(number).unwrap();
  //         showMessage('Номер успешно сохранен')
  //       }
  //     } catch {
  //       showMessage('Ошибка при сохранении номера', 'fail');
  //     }
  //   }, 500)
  // ).current;


  // useEffect(() => {
  //   if(phoneNumber?.phoneNumber) setPhone(phoneNumber.phoneNumber)
  // }, [phoneNumber])

  // const handleChangePhone = (value: string) => {
  //   setPhone(value)
  //   debouncedSave(value)
  // }


  const nameParts = data?.participant.fullname.split(' ') || [];
  const [lastName, firstName, middleName] = nameParts;
  
  const nameFields = [
  {
    title: "Фамилия",
    value: lastName || '',
    required: true
  },
  {
    title: "Имя",
    value: firstName || '',
    required: true
  },
  {
    title: "Отчество",
    value: middleName || '',
    required: true
  }
];

const additionalInformationFields = [
  {
    title: "Занимаемая должность",
    value: data?.participant?.jobTitle || '',
    required: true,
    disabled: true
  },
  {
    title: "Ученая степень",
    value: data?.participant?.scientificDegree || '',
    required: true,
    disabled: true

  },
]

  return (
    // isLoadingPhone ? <Preloader variant="large-primary" /> :
    <>
        <div className={styles.header}>
            <h4>Общие сведения</h4>
            { data && 'status' in data ? <Status section='myApplications'>{data.status}</Status> : <Status section='myApplications'>Черновик</Status> }
        </div>
        <div className={styles.main}>
          <div className={styles.nameUser}>
             {nameFields.map((field, index) => (
                <InputText
                  key={index}
                  required={field.required}
                  disabled
                  title={field.title}
                  value={field.value}
                  placeholder=""
                />
              ))}
          </div>
          <InputText
            required
            disabled
            title="Место работы"
            value={data?.participant?.divisionTitle || ""}
            placeholder=""
          />
          <div className={styles.additionalInformation}>
             {additionalInformationFields.map((field, index) => (
                <InputText
                  key={index}
                  required={field.required}
                  disabled={field.disabled}
                  title={field.title}
                  value={field.value}
                  placeholder=""
                />
              ))}
              {/* <PhoneInput value={phone} label='Контактный телефон' onChange={handleChangePhone} required={true} disabled={isLoadingPhone} /> */}
          </div>
        </div>
    </>
    
  )
}
