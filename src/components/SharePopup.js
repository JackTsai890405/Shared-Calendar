import React, { useEffect, useState, useContext } from 'react';
import styledComponents from 'styled-components'
// Firebase Firestore
import db from '../firebase.js';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import MemberError from './member/MemberError.js';
import { Inner, Popup } from './calendar/calendarCSS.js';

const Flex = styledComponents.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 24px;
    width: 80%;
    justify-content: center;
`

const FlexButton = styledComponents(Flex)`
    justify-content: space-around;
    width: 75%;
`

const InputMail = styledComponents.input`
    margin-left: 8px;
    padding: 8px;
    font-size: 16px;
    cursor: text;
    width: 175px;

    border-radius: 4px;
    border: 1px solid #ddd;
    box-shadow: 0 0 0 1000px #fff inset;
    transform: translateX(0) translateY(0);
    transition: border 0.25s linear, transform 0.25s linear;
  
    &:focus {
        border-color: lightblue;
        border-width: 2px;
        outline: none;
        transform: translateX(-1px) translateY(-1px);
    }    
`

const AuthorityText = styledComponents.p`
    font-size: 16px;
`

const CheckIcon = styledComponents.span`
    margin: 0 8px;
    line-height: 16px;
`

const Button = styledComponents.button`
    padding: 0 10px;
    border: none;
    outline: none;

    width: 40%;
    height: 50px;

    cursor: pointer;
    border-radius: 5px;

    font-weight: bold;

    color: ${props => props.add ? 'rgb(255, 255, 255)' : 'rgb(143, 143, 143)'};
    background-color: ${props => props.add ? 'rgb(46, 204, 135)' : 'rgb(255, 255, 255)'};

    &:hover {
      opacity: 0.8;
    }
`

function SharePopup({friendMail, setFriendMail, uid, userMail, setShowSharePopup}) {
    const [shareCalendarLevel, setShareCalendarLevel] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");    

    async function addDataInAuthority() {
        // Step1(??????)
        const q = query(collection(db, "members"), where("mail", "==", friendMail));
        const querySnapshot = await getDocs(q);

        if(querySnapshot.docs.length > 0) {
            // Step2(??????)
            const docRef = await addDoc(collection(db, "authority"), {
                // ???????????????
                myUid: uid,
                myMail: userMail, 
                friendUid: querySnapshot.docs[0].data().uid, 
                friendMail: querySnapshot.docs[0].data().mail,                
                read: shareCalendarLevel, 
            });

            // Step3(??????????????????????????? Popup)
            setFriendMail('');
            setShareCalendarLevel(false);
            setShowSharePopup(false);            
        } else {
            // Step2(??????)
            console.log('Step2(??????)');
            disappear();
            setErrorMessage('????????????');
        }
    }

    const disappear = () => {
        setShowErrorMessage(true);        
        const timer = setTimeout(() => {
            setShowErrorMessage(false);
            // Step3(?????????)
            setFriendMail('');
            setShareCalendarLevel(false);
        }, 2000);
        return () => clearTimeout(timer);
    }

    return (
        <Popup
            onClick={() => {
                setFriendMail('');
                setShareCalendarLevel(false);
                setShowSharePopup(false);                
            }}
        >
            <Inner
                sharePopup
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {/* ???????????? */}
                <Flex>
                    <span className="material-symbols-outlined">
                        forward_to_inbox
                    </span>
                    <label>
                        <InputMail 
                            type='email'
                            value={friendMail}
                            onChange={e => {setFriendMail(e.target.value)}}
                        />                                
                    </label>
                </Flex>
                {/* ?????? ??? ?????? */}
                <Flex>
                    <AuthorityText>????????????</AuthorityText>
                    {
                        shareCalendarLevel ? (
                            <CheckIcon 
                                className="material-symbols-outlined"
                                onClick={() => setShareCalendarLevel(false)}
                            >
                                radio_button_checked
                            </CheckIcon>
                        ) : (
                            <CheckIcon 
                                className="material-symbols-outlined"
                                onClick={() => setShareCalendarLevel(true)}
                            >
                                radio_button_unchecked
                            </CheckIcon>
                        )
                    }
                    {
                        shareCalendarLevel ? (
                            <p>???????????????</p>
                        ) : (
                            <p>??????</p>
                        )
                    }
                </Flex>                 
                
                <FlexButton>
                    <Button onClick={addDataInAuthority} add>????????????</Button>
                    <Button onClick={() => setShowSharePopup(false)} close>????????????</Button>
                </FlexButton>
                
                {
                    showErrorMessage && (
                        <MemberError
                            errorMessage={errorMessage}
                        />
                    )
                }                    
            </Inner>
        </Popup>
    )
}

export default SharePopup