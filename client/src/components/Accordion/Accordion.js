import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import './Accordion.css';
import { v4 } from 'uuid';
import { useAuth0  } from '@auth0/auth0-react';
import axios from 'axios';

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'white',
    boxShadow: '2px 4px 8px #ababab',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {

      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'wrap',
    padding: theme.spacing(2),
  }
}))(MuiAccordionDetails);

export default function CustomAccordion(props) {
const [expanded, setExpanded] = React.useState('');
const [subExpanded, setSubExpanded] = React.useState('');

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  const handleSubChange = (panel) => (event, newExpanded) => {
    setSubExpanded(newExpanded ? panel : false);
  };

  const {user, isAuthenticated, isLoading} = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  let data = props.data;

  const handleSignUpForEvent = (data, position) => {
    //TODO: SIGN UP FLow
    //TEST MESSGE
    console.log("Accordion handleSignUpForEvent");
    console.log("data:", data);
    console.log("position:", position);

    console.log("volunteers in position:",data.volunteers[position]);


    if(isAuthenticated)
    {
      var safeEmail = user.email;
    }
    else
    {
      var safeEmail = "BAD@gmail.com"
    }
    //Check if a user with the email exists
    console.log('Email checked: ', safeEmail);

    axios.get('/users', { params: { email: safeEmail } } )
      .then(res => {
        console.log('User Returned:',res.data);
        console.log('user ID:', res.data._id);
        
        let newLesson = data;
        newLesson.volunteers[position].signedUp.push(res.data._id);
        console.log(newLesson);

        let urlExtension = '/lessons/'+newLesson._id;
        axios.put(urlExtension, newLesson)
          .then(result => console.log("put new lesson result:", result))
          .catch(error => console.log("put new lesson error:", error))
        
      })
      .catch(err => console.log("Error-Register_for_event: ", err.data));
  }

  return (
        <div>
            <CloseIcon style={{float: 'right', fontSize: '2rem', cursor: 'pointer'}} onClick={props.handleClose} />
            <div className="modal-heading">{data.title}- {data.start.toDateString()}</div>
            {
              data && Object.keys(data.volunteers).map((pos, index) => {
                return (
                    <div key={v4()}>
                      {data.volunteers[pos].minVolunteers >= 1 ?
                        <Accordion key={v4()} square expanded={expanded === `panel-${index}`} onChange={handleChange(`panel-${index}`)}>
                            <AccordionSummary aria-controls="panel1d-content" id={`panel1d-header-${index}`}>
                              <Typography >{pos}</Typography>
                            </AccordionSummary>
                            <AccordionDetails >
                                <Accordion key={v4()} square expanded={subExpanded === `subpanel-${pos}-${index}`} onChange={handleSubChange(`subpanel-${pos}-${index}`)}>
                                    <AccordionSummary id={`subpanel-${index}-header`} >
                                      <div style={{ display: 'flex', flex: '1 1 auto', justifyContent: 'space-between', alignItems: 'center', verticalAlign:'center', height: '1rem'}}>
                                          <div>{data.volunteers[pos].signedUp.length} of {data.volunteers[pos].minVolunteers} filled</div>
                                          {data.volunteers[pos].minVolunteers - data.volunteers[pos].signedUp.length !== 0 ? <Button variant="contained" color="primary" onClick={() => handleSignUpForEvent(data, pos)}>Sign up</Button> : <></>}
                                      </div>
                                    </AccordionSummary>
                                </Accordion>
                            </AccordionDetails>
                        </Accordion>
                      : <></>}
                    </div>
                )
              })
            }
        </div>
  );
}
