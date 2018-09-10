import React from "react";
import styled from "styled-components";
import Paper from "@material-ui/core/Paper";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";

const Wrapper = styled.div`
  cursor: pointer;
`;


export default ({ chatroom, onEnter }) => (
    <Paper
        style={{ maxWidth: 600, marginBottom: 40 }}
    >
        <Wrapper onClick={onEnter}>
            <Card>
                <CardMedia
                    component="img"
                    height="100%"
                    image={chatroom.image}
                >
                </CardMedia>
            </Card>
        </Wrapper>
    </Paper>
);